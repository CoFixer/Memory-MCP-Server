import { Injectable } from '@nestjs/common';
import { Memory } from '../../database/entities/memory.entity';

@Injectable()
export class RankingService {
  rank(memories: Memory[], query: string): Memory[] {
    return memories.sort((a, b) => {
      const aScore = this.calculateScore(a, query);
      const bScore = this.calculateScore(b, query);
      return bScore - aScore;
    });
  }

  private calculateScore(memory: Memory, query: string): number {
    let score = 0;
    score += (memory.importance / 10) * 0.3;
    score += this.recencyScore(memory.updated_at) * 0.2;
    score += this.relevanceScore(memory, query) * 0.5;
    return score;
  }

  private recencyScore(date: Date): number {
    const days = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - days / 365);
  }

  private relevanceScore(memory: Memory, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = memory.content.toLowerCase().split(/\s+/);
    const matches = queryWords.filter((qw) => contentWords.some((cw) => cw.includes(qw))).length;
    return matches / queryWords.length;
  }
}
