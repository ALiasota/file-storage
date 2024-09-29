import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { GoogleGuard } from 'src/guards/google.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(GoogleGuard)
  @Get('google-callback')
  async googleCallback(@Req() req) {
    console.log(req.user);
    const { email, firstName, lastName, accessToken } = req.user;
    const user = await this.authService.googleSignIp({
      email,
      firstName,
      lastName,
    });
    return { user, accessToken };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req) {
    console.log(req);
  }

  @Get('health')
  @HttpCode(200)
  async health() {
    return 'health';
  }
}
