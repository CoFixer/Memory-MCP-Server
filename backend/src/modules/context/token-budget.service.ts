import { Injectable } from '@nestjs/common';
import { Memory } from '../../database/entities/memory.entity';

@Injectable()
export class TokenBudgetService {
  estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  estimateMemoryTokens(memory: Memory): number {
    const text = `${memory.title || ''} ${memory.content}`;
    return this.estimateTokens(text);
  }

  fitWithinBudget(memories: Memory[], maxTokens: number): Memory[] {
    const result: Memory[] = [];
    let usedTokens = 0;

    for (const memory of memories) {
      const tokens = this.estimateMemoryTokens(memory);
      if (usedTokens + tokens > maxTokens) break;
      result.push(memory);
      usedTokens += tokens;
    }

    return result;
  }
}
