import OpenAI from 'openai';
import { Finding } from '../findings/finding';

import { AIExplanation } from '@secureguard/shared';

export interface AIProvider {
  explain(finding: Finding): Promise<AIExplanation | null>;
}

export { AIExplanation };
export class GroqProvider implements AIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: 'ollama', // API key is not required for Ollama
      baseURL: process.env.OLLAMA_URL || 'http://127.0.0.1:11434/v1' 
    });
  }

  async explain(finding: Finding): Promise<AIExplanation | null> {
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
  "whatIsWrong": "...",
  "whyItMatters": "...",
  "attackerImpact": "...",
  "recommendation": "...",
  "secureCodeExample": "...",
  "explanation": "..."
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OLLAMA_MODEL || 'llama3',
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
