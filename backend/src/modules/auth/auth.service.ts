import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ApiKey } from '../../database/entities/api-key.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateApiKey(key: string): Promise<{ user: User; apiKey: ApiKey } | null> {
    const prefix = key.substring(0, 8);
    const apiKeys = await this.apiKeyRepository.find({
      where: { prefix },
      relations: ['user'],
    });

    for (const apiKey of apiKeys) {
      const hash = crypto.createHash('sha256').update(key).digest('hex');
      if (apiKey.key_hash === hash && !apiKey.revoked_at) {
        if (apiKey.expires_at && new Date() > apiKey.expires_at) {
          continue;
        }
        apiKey.last_used_at = new Date();
        await this.apiKeyRepository.save(apiKey);
        return { user: apiKey.user, apiKey };
      }
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, name?: string, role?: UserRole) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
      email,
      name: name || null,
      password_hash,
      role: role || UserRole.USER,
    });
    const saved = await this.userRepository.save(user);

    const payload = { sub: saved.id, email: saved.email, role: saved.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: saved.id,
        email: saved.email,
        name: saved.name,
        role: saved.role,
      },
    };
  }
}
