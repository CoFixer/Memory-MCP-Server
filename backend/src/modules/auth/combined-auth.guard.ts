import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);

    // Try API key first (starts with mem_live_)
    if (token.startsWith('mem_live_')) {
      const keyData = await this.authService.validateApiKey(token);
      if (keyData) {
        request['user'] = keyData.user;
        request['apiKey'] = keyData.apiKey;
        return true;
      }
      throw new UnauthorizedException('Invalid API key');
    }

    // Try JWT token
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'change-me-in-production'),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid JWT token');
      }
      request['user'] = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
