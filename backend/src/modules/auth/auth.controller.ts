import { Controller, Post, Get, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class SetupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Dashboard login' })
  @ApiResponse({ status: 200, description: 'JWT token returned' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identifier, dto.password);
  }

  @Get('setup-required')
  @ApiOperation({ summary: 'Check if initial admin setup is required' })
  @ApiResponse({ status: 200, description: 'Returns setup required status' })
  async setupRequired() {
    const required = await this.authService.isSetupRequired();
    return { setup_required: required };
  }

  @Post('setup')
  @ApiOperation({ summary: 'Initial admin setup (only allowed when no admin exists)' })
  @ApiResponse({ status: 201, description: 'Admin created' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async setup(@Body() dto: SetupDto) {
    return this.authService.setupAdmin(dto.email, dto.password, dto.name, dto.username);
  }

  @Post('reset-setup')
  @ApiOperation({ summary: 'Reset setup - DEVELOPMENT ONLY' })
  @ApiResponse({ status: 200, description: 'All users cleared' })
  async resetSetup() {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Not allowed in production');
    }
    return this.authService.resetSetup();
  }
}
