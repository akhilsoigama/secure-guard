import type { AIExplanation, Finding } from '@secureguard/shared'
import { GroqProvider } from 'secureguard'

export default class AiService {
  private aiProvider: GroqProvider

  constructor() {
    this.aiProvider = new GroqProvider()
  }

  async explain(finding: Finding): Promise<AIExplanation | null> {
    // Always use the real provider (Ollama)
    try {
      const result = await this.aiProvider.explain(finding as any)
      return result as any as AIExplanation
    } catch (e) {
      console.error('AI Service Error:', e)
      return null
    }
  }
}
