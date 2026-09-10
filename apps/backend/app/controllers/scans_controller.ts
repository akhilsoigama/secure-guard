import { HttpContext } from '@adonisjs/core/http';
import ScanService from '#services/scan_service';
import { inject } from '@adonisjs/core';

@inject()
export default class ScansController {
  constructor(private scanService: ScanService) {}

  async create({ request, response }: HttpContext) {
    const { projectPath, aiEnabled } = request.only(['projectPath', 'aiEnabled']);

    if (!projectPath) {
      return response.badRequest({ error: 'projectPath is required' });
    }

    const scan = await this.scanService.startScan(projectPath, aiEnabled ?? false);
    return response.created(scan);
  }

  async show({ params, response }: HttpContext) {
    const scan = this.scanService.getScan(params.id);
    if (!scan) {
      return response.notFound({ error: 'Scan not found' });
    }
    return response.ok(scan);
  }

  async getFindings({ params, request, response }: HttpContext) {
    const findings = this.scanService.getFindings(params.id);
    if (!findings) {
      return response.notFound({ error: 'Scan not found' });
    }
    const severity = request.input('severity');
    if (severity) {
      return response.ok(findings.filter((f) => f.severity === severity));
    }
    return response.ok(findings);
  }

  async getScore({ params, response }: HttpContext) {
    const scan = this.scanService.getScan(params.id);
    if (!scan) {
      return response.notFound({ error: 'Scan not found' });
    }
    if (scan.status === 'running' || scan.status === 'queued') {
      return response.badRequest({ error: 'Scan is not complete yet' });
    }
    return response.ok(scan.score);
  }
}
