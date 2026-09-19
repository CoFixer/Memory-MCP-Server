import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  imports: [ConfigModule],
  providers: [EmbeddingService, OllamaProvider, OpenAIProvider, OpenRouterProvider],
  exports: [EmbeddingService],
})
export class EmbeddingsModule {}
