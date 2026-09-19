import { Controller, Post, Req, Res, Headers, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post()
  async handleMcpRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const apiKey = authHeader.substring(7);
    const userData = await this.mcpService.validateApiKey(apiKey);
    if (!userData) {
      throw new UnauthorizedException('Invalid API key');
    }

    const result = await this.mcpService.handleRequest(req.body, userData.user);
    res.json(result);
  }
}
