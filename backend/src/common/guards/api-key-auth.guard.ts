import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const apiKey = authHeader.substring(7);
    const keyData = await this.apiKeysService.validateKey(apiKey);

    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    request['user'] = keyData.user;
    request['apiKey'] = keyData;
    return true;
  }
}
