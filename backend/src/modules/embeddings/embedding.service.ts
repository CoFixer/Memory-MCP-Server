import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from './embedding-provider.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class EmbeddingService implements EmbeddingProvider {
  private provider: EmbeddingProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaProvider: OllamaProvider,
    private readonly openAIProvider: OpenAIProvider,
    private readonly openRouterProvider: OpenRouterProvider,
  ) {
    const providerName = this.configService.get<string>('EMBEDDING_PROVIDER', 'ollama');
    switch (providerName) {
      case 'ollama':
        this.provider = this.ollamaProvider;
        break;
      case 'openai':
        this.provider = this.openAIProvider;
        break;
      case 'openrouter':
        this.provider = this.openRouterProvider;
        break;
      default:
        this.provider = this.ollamaProvider;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  getDimensions(): number {
    return this.provider.getDimensions();
  }
}
