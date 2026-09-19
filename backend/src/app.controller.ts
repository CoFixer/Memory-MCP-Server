import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get service info' })
  @ApiResponse({ status: 200, description: 'Service information' })
  getInfo() {
    return {
      name: 'Memory MCP Server',
      version: '1.0.0',
      protocol: 'MCP Streamable HTTP',
      endpoint: '/mcp',
    };
  }
}
