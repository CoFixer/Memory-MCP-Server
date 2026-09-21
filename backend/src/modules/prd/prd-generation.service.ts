import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface GeneratePrdDto {
  name?: string;
  description?: string;
  summary?: string;
  product_type?: string[];
  target_users?: string[];
  business_goals?: string[];
  preferred_stack?: string[];
  deployment_target?: string[];
  known_modules?: string[];
  known_integrations?: string[];
  constraints?: string[];
  additional_notes?: string;
}

export interface GeneratedPrdResult {
  prd_content: string;
  suggestions: {
    name?: string;
    slug?: string;
    description?: string;
    git_remote?: string;
    repository_url?: string;
    summary?: string;
    product_type?: string[];
    target_users?: string[];
    business_goals?: string[];
    preferred_stack?: string[];
    deployment_target?: string[];
    known_modules?: string[];
    known_integrations?: string[];
    constraints?: string[];
    additional_notes?: string;
  };
}

@Injectable()
export class PrdGenerationService {
  private client: OpenAI | null = null;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    this.model = this.configService.get<string>('LLM_MODEL') || 'gpt-4o-mini';
    const baseURL = this.configService.get<string>('LLM_BASE_URL');

    if (!apiKey) {
      // Lazy error — will throw on first use so the app can still boot
      return;
    }

    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }

  async generate(dto: GeneratePrdDto): Promise<GeneratedPrdResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'LLM_API_KEY is not configured. Set it in your environment to enable PRD generation.',
      );
    }

    const prompt = this.buildPrompt(dto);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical product manager and software architect. You write detailed, development-friendly Product Requirements Documents (PRDs) following industry best practices. You always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new ServiceUnavailableException('LLM returned invalid JSON');
    }

    return {
      prd_content: parsed.prd_content || '',
      suggestions: parsed.suggestions || {},
    };
  }

  private buildPrompt(dto: GeneratePrdDto): string {
    const fields = [
      dto.name && `Project Name: ${dto.name}`,
      dto.description && `Description: ${dto.description}`,
      dto.summary && `Summary: ${dto.summary}`,
      dto.product_type?.length && `Product Type: ${dto.product_type.join(', ')}`,
      dto.target_users?.length && `Target Users: ${dto.target_users.join(', ')}`,
      dto.business_goals?.length && `Business Goals: ${dto.business_goals.join(', ')}`,
      dto.preferred_stack?.length && `Preferred Stack: ${dto.preferred_stack.join(', ')}`,
      dto.deployment_target?.length && `Deployment Target: ${dto.deployment_target.join(', ')}`,
      dto.known_modules?.length && `Known Modules: ${dto.known_modules.join(', ')}`,
      dto.known_integrations?.length && `Known Integrations: ${dto.known_integrations.join(', ')}`,
      dto.constraints?.length && `Constraints: ${dto.constraints.join(', ')}`,
      dto.additional_notes && `Additional Notes: ${dto.additional_notes}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `Given the following project information, generate a comprehensive, development-friendly PRD and suggest values for any missing fields.

${fields || 'No specific details provided yet.'}

Requirements:
1. The PRD must be in Markdown format and follow software development best practices.
2. Include sections: Overview, Goals, Non-Goals, User Stories, Functional Requirements, Non-Functional Requirements, API Design (if applicable), Data Model, Architecture Overview, Security Considerations, Deployment Strategy, Milestones / Roadmap, Open Questions.
3. Use clear, actionable language suitable for developers.
4. For any fields not provided above, suggest reasonable values based on the project context.
5. Return ONLY a JSON object with this exact shape:

{
  "prd_content": "string (full markdown PRD)",
  "suggestions": {
    "name": "string or omit",
    "slug": "string or omit",
    "description": "string or omit",
    "git_remote": "string or omit",
    "repository_url": "string or omit",
    "summary": "string or omit",
    "product_type": ["array of strings or omit"],
    "target_users": ["array of strings or omit"],
    "business_goals": ["array of strings or omit"],
    "preferred_stack": ["array of strings or omit"],
    "deployment_target": ["array of strings or omit"],
    "known_modules": ["array of strings or omit"],
    "known_integrations": ["array of strings or omit"],
    "constraints": ["array of strings or omit"],
    "additional_notes": "string or omit"
  }
}`;
  }
}
