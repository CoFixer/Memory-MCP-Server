import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from '../embedding-provider.interface';
import OpenAI from 'openai';

export interface OpenRouterProviderConfig {
  apiKey: string;
  model: string;
  dimensions: number;
  baseUrl?: string;
}

@Injectable()
export class OpenRouterProvider implements EmbeddingProvider {
  private config: OpenRouterProviderConfig | null = null;
  private client: OpenAI | null = null;

  setConfig(config: OpenRouterProviderConfig): void {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://openrouter.ai/api/v1',
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config || !this.client) {
      throw new Error('OpenRouterProvider config not set');
    }
    const response = await this.client.embeddings.create({
      model: this.config.model,
      input: text,
    });
    return response.data[0].embedding;
  }

  getDimensions(): number {
    if (!this.config) {
      throw new Error('OpenRouterProvider config not set');
    }
    return this.config.dimensions;
  }
}
