import { test } from 'node:test';
import * as assert from 'node:assert';
import { parse } from '@typescript-eslint/typescript-estree';
import { SsrfRule } from '../src/rules/ssrf';
import { MassAssignmentRule } from '../src/rules/mass-assignment';
import { JwtMisconfigRule } from '../src/rules/jwt-confusion';
import { SqliRule } from '../src/rules/sqli';

function parseCode(code: string) {
  return parse(code, { loc: true, range: true, jsx: true });
}

test('SSRF Rule Detects Vulnerability', async () => {
  const rule = new SsrfRule();
  const code = `
    app.get('/proxy', (req, res) => {
      const target = req.query.url;
      fetch(target).then(r => r.json());
    });
  `;
  const context = { ast: parseCode(code), file: 'test.ts', content: code };
  const findings = await rule.detect(context);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, 'SSRF-001');
});

test('SSRF Rule Ignores Safe Code', async () => {
  const rule = new SsrfRule();
  const code = `
    app.get('/proxy', (req, res) => {
      fetch('https://api.github.com/users').then(r => r.json());
    });
  `;
  const context = { ast: parseCode(code), file: 'test.ts', content: code };
  const findings = await rule.detect(context);
  assert.strictEqual(findings.length, 0);
});

test('Mass Assignment Detects Vulnerability', async () => {
  const rule = new MassAssignmentRule();
  const code = `
    app.post('/user', (req, res) => {
      User.create(req.body);
    });
  `;
  const context = { ast: parseCode(code), file: 'test.ts', content: code };
  const findings = await rule.detect(context);
  assert.strictEqual(findings.length, 1);
});

test('JWT Confusion Detects Vulnerability', async () => {
  const rule = new JwtMisconfigRule();
  const code = `
    jwt.verify(token, secret);
  `;
  const context = { ast: parseCode(code), file: 'test.ts', content: code };
  const findings = await rule.detect(context);
  assert.strictEqual(findings.length, 1);
});

test('SQLi Detects Vulnerability', async () => {
  const rule = new SqliRule();
  const code = `
    const query = knex.raw("SELECT * FROM users WHERE id = " + req.params.id);
  `;
  const context = { ast: parseCode(code), file: 'test.ts', content: code };
  const findings = await rule.detect(context);
  assert.strictEqual(findings.length, 1);
});
