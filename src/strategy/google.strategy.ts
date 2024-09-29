import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET'),
      callbackURL: `${configService.get<string>(
        'API_BASE_URL',
      )}api/auth/google-callback`,
      scope: ['email', 'profile'],
      profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
