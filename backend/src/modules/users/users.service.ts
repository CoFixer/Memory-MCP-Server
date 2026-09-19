import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateByEmail(email: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = this.userRepository.create({ email });
      user = await this.userRepository.save(user);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'metadata', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 12);
    const user = this.userRepository.create({
      email: data.email,
      name: data.name || null,
      password_hash,
      role: data.role || UserRole.USER,
    });
    return this.userRepository.save(user);
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; role: UserRole; password: string }>,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.name !== undefined) user.name = data.name || null;
    if (data.role !== undefined) user.role = data.role;
    if (data.password) user.password_hash = await bcrypt.hash(data.password, 12);
    user.updated_at = new Date();
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }
}
