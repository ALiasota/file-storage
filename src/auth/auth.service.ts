import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

export interface IGoogleUser {
  email: string;
  firstName?: string;
  lastName?: string;
  googleAccessToken: string;
  googleRefreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async googleSignIp(googleUser: IGoogleUser) {
    let user = await this.usersService.getUserByEmail(googleUser.email);
    if (!user) user = await this.usersService.createUser(googleUser);
    else user = await this.usersService.updateUser(user.id, googleUser);
    return user;
  }
}
