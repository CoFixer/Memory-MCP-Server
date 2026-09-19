import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from '../embedding-provider.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenRouterProvider implements EmbeddingProvider {
  private client: OpenAI;
  private readonly model: string;
  private readonly dimensions: number;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>('EMBEDDING_MODEL', 'openai/text-embedding-3-small');
    this.dimensions = parseInt(this.configService.get<string>('EMBEDDING_DIMENSIONS', '1536'), 10);
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
    }
    return this.client;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.getClient().embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }

  getDimensions(): number {
    return this.dimensions;
  }
}
