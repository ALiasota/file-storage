import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from 'src/strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule.register({ session: true }), UsersModule],
  providers: [GoogleStrategy, SessionSerializer, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
