import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EmbeddingConfigService } from './embedding-config.service';
import { EmbeddingProvider } from './embedding-provider.interface';

@Injectable()
export class EmbeddingService {
  constructor(private readonly configService: EmbeddingConfigService) {}

  private async getProvider(): Promise<EmbeddingProvider> {
    const config = await this.configService.getActiveConfig();
    if (!config) {
      throw new ServiceUnavailableException('No active embedding provider configured');
    }
    return this.configService.configureProvider(config);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const provider = await this.getProvider();
    return provider.generateEmbedding(text);
  }

  async getDimensions(): Promise<number> {
    const provider = await this.getProvider();
    return provider.getDimensions();
  }
}
