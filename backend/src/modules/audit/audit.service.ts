import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string | null,
    event: string,
    metadata: Record<string, any> = {},
    options: {
      actor?: string;
      client?: string;
      ipAddress?: string;
      resourceType?: string;
      resourceId?: string;
    } = {},
  ): Promise<void> {
    const log = this.auditLogRepository.create({
      user_id: userId,
      event,
      actor: options.actor || null,
      client: options.client || null,
      ip_address: options.ipAddress || null,
      resource_type: options.resourceType || null,
      resource_id: options.resourceId || null,
      metadata,
    });
    await this.auditLogRepository.save(log);
  }
}
