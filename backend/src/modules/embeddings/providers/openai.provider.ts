import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from '../embedding-provider.interface';
import OpenAI from 'openai';

export interface OpenAIProviderConfig {
  apiKey: string;
  model: string;
  dimensions: number;
}

@Injectable()
export class OpenAIProvider implements EmbeddingProvider {
  private config: OpenAIProviderConfig | null = null;
  private client: OpenAI | null = null;

  setConfig(config: OpenAIProviderConfig): void {
    this.config = config;
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config || !this.client) {
      throw new Error('OpenAIProvider config not set');
    }
    const response = await this.client.embeddings.create({
      model: this.config.model,
      input: text,
      dimensions: this.config.dimensions,
    });
    return response.data[0].embedding;
  }

  getDimensions(): number {
    if (!this.config) {
      throw new Error('OpenAIProvider config not set');
    }
    return this.config.dimensions;
  }
}
