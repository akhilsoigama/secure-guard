import { HttpContext } from '@adonisjs/core/http';
import AiService from '#services/ai_service';
import ScanService from '#services/scan_service';
import { inject } from '@adonisjs/core';

@inject()
export default class FindingsController {
  constructor(
    private aiService: AiService,
    private scanService: ScanService
  ) {}

  async explain({ params, response }: HttpContext) {
    const findingId = params.id;
    const finding = this.scanService.getFindingById(findingId);
    
    if (!finding) {
      return response.notFound({ error: 'Finding not found' });
    }

    if (finding.aiExplanation) {
      return response.ok(finding.aiExplanation);
    }

    try {
      this.scanService.updateFindingStatus(findingId, 'loading');
      const explanation = await this.aiService.explain(finding);
      if (explanation) {
         this.scanService.updateFindingExplanation(findingId, explanation);
         return response.ok(explanation);
      }
      this.scanService.updateFindingStatus(findingId, 'error');
      return response.internalServerError({ error: 'Failed to generate explanation' });
    } catch (error) {
      this.scanService.updateFindingStatus(findingId, 'error');
      return response.internalServerError({ error: 'AI Provider error' });
    }
  }
}
