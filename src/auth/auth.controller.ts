import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleGuard } from 'src/guards/google.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated via Google',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
          },
        },
        accessToken: { type: 'string', example: 'access_token_value' },
      },
    },
  })
  @Get('google-callback')
  async googleCallback(@Req() req) {
    const { email, firstName, lastName, accessToken, refreshToken } = req.user;
    return await this.authService.googleSignIp({
      email,
      firstName,
      lastName,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    });
  }

  @ApiOperation({ summary: 'Redirect to Google OAuth2' })
  @ApiResponse({
    status: 302,
    description: 'Redirects the user to Google OAuth2 for authentication',
  })
  @UseGuards(GoogleGuard)
  @Get('google')
  async googleAuth(@Req() req) {
    console.log(req);
  }

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'The service is healthy' })
  @Get('health')
  @HttpCode(200)
  async health() {
    return 'health';
  }
}
