import OpenAI from 'openai';
import { Finding } from '../findings/finding';

export interface AIExplanation {
  summary: string;
  whyItMatters: string;
  attackerImpact: string;
  fix: string;
  secureCodeExample: string;
  confidence: number;
}

export interface AIProvider {
  explain(finding: Finding): Promise<AIExplanation | null>;
}

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async explain(finding: Finding): Promise<AIExplanation | null> {
    if (!this.openai) {
      return null;
    }

    const prompt = `
You are an expert Application Security Engineer.
Analyze this vulnerability finding and provide an explanation.

Vulnerability: ${finding.title}
Description: ${finding.description}
File: ${finding.file}:${finding.line}
Code Snippet:
\`\`\`
${finding.codeSnippet}
\`\`\`

Respond ONLY with valid JSON in the following format:
{
  "summary": "...",
  "whyItMatters": "...",
  "attackerImpact": "...",
  "fix": "...",
  "secureCodeExample": "...",
  "confidence": 0.95
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) return null;

      return JSON.parse(content) as AIExplanation;
    } catch (e) {
      console.error('AI Explanation failed:', e);
      return null;
    }
  }
}
