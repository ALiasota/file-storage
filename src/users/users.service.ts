import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async getUserByToken(token: string) {
    return await this.userRepository.findOne({
      where: { googleAccessToken: token },
    });
  }

  async createUser(newUser: Partial<UserEntity>) {
    const user = this.userRepository.create(newUser);
    return await this.userRepository.save(user);
  }

  async updateUser(id: number, user: Partial<UserEntity>) {
    return this.userRepository.save({ id, ...user });
  }
}
