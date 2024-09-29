import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('jwt') {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    let user = await this.usersService.getUserByToken(token);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isValidToken = await this.validateGoogleToken(token);

    if (!isValidToken) {
      const response = await this.refreshGoogleAccessToken(
        user.googleRefreshToken,
      );
      if (user.googleRefreshToken)
        user = await this.usersService.updateUser(user.id, response);
      else throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = user;

    return true;
  }

  private extractTokenFromRequest(req: any): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const [, token] = authHeader.split(' ');
    return token;
  }

  private async validateGoogleToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
      );
      return response.status === 200;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  private async refreshGoogleAccessToken(refreshToken: string) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_SECRET'),
        grant_type: 'refresh_token',
      });

      const { access_token, refresh_token } = response.data;
      return {
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token || refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
