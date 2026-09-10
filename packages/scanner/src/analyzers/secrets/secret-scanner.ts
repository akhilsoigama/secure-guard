import { Finding } from '../../findings/finding';
import { Severity } from '../../findings/severity';

export class SecretScanner {
  private readonly secretPatterns = [
    { name: 'AWS Access Key', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
    { name: 'Generic Secret', regex: /['"]?(?:secret|password|api_?key|token)['"]?\s*[:=]\s*['"]([a-zA-Z0-9\-_]{16,})['"]/i }
  ];

  scan(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of this.secretPatterns) {
        const match = pattern.regex.exec(line);
        if (match) {
          findings.push({
            id: crypto.randomUUID(),
            ruleId: 'SECRET-001',
            title: `Hardcoded Secret Detected: ${pattern.name}`,
            severity: Severity.CRITICAL,
            confidence: 0.9,
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            codeSnippet: line.replace(match[0], '********'), // Redact secret
            description: `Detected a hardcoded ${pattern.name} in the source code.`,
            risk: 'Hardcoded secrets can be easily extracted by attackers, leading to unauthorized access.',
            recommendation: 'Remove the secret from the source code and use environment variables or a secret management service.'
          });
        }
      }
    }

    return findings;
  }
}
