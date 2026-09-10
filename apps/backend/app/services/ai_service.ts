import type { AIExplanation, Finding } from '@secureguard/shared'
import { GroqProvider } from 'secureguard'

export default class AiService {
  private aiProvider: GroqProvider

  constructor() {
    this.aiProvider = new GroqProvider()
  }

  async explain(finding: Finding): Promise<AIExplanation | null> {
    if (!process.env.GROQ_API_KEY) {
      // Return a robust mock response so the UI works without an API key
      return {
        summary: `Simulated analysis for ${finding.title}`,
        whatIsWrong: `The scanner detected a potential security issue related to ${finding.title}. In the file ${finding.file} at line ${finding.line}, the code uses an insecure pattern that could be exploited.`,
        whyItMatters: `This is important because ${finding.risk}. If left unpatched, it could compromise the integrity of the application.`,
        attackerImpact: `An attacker could leverage this vulnerability to gain unauthorized access, execute arbitrary code, or extract sensitive information from the system.`,
        recommendation: `Refactor the code to use secure defaults. ${finding.recommendation}`,
        secureCodeExample: `// Use a secure alternative:\nconst secureImplementation = new SecureImplementation();\nsecureImplementation.executeSafe();`,
        explanation: `This is a mock explanation generated because no Groq API key was found in the environment variables.`
      }
    }
    try {
      const result = await this.aiProvider.explain(finding as any)
      return result as any as AIExplanation
    } catch (e) {
      console.error('AI Service Error:', e)
      return null
    }
  }
}
