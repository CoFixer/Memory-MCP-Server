import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from '../embedding-provider.interface';

export interface OllamaProviderConfig {
  baseUrl: string;
  model: string;
  dimensions: number;
}

@Injectable()
export class OllamaProvider implements EmbeddingProvider {
  private config: OllamaProviderConfig | null = null;

  setConfig(config: OllamaProviderConfig): void {
    this.config = config;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config) {
      throw new Error('OllamaProvider config not set');
    }
    const response = await fetch(`${this.config.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.config.model, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  getDimensions(): number {
    if (!this.config) {
      throw new Error('OllamaProvider config not set');
    }
    return this.config.dimensions;
  }
}
