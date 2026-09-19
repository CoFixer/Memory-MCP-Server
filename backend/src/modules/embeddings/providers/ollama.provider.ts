import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from '../embedding-provider.interface';

@Injectable()
export class OllamaProvider implements EmbeddingProvider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly dimensions: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('EMBEDDING_BASE_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('EMBEDDING_MODEL', 'nomic-embed-text');
    this.dimensions = parseInt(this.configService.get<string>('EMBEDDING_DIMENSIONS', '768'), 10);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  getDimensions(): number {
    return this.dimensions;
  }
}
