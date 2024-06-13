import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthMapper } from './mapper/auth.mapper';
import { PoliceModule } from '../police/police.module';

@Module({
  imports: [
    JwtModule.register({
      secret: Buffer.from(
        process.env.TOKEN_SECRET || 'Contrasena_Ultra_Secreta',
        'utf-8',
      ).toString('base64'),
      signOptions: {
        expiresIn: Number(process.env.TOKEN_EXPIRES) || 3600,
        algorithm: 'HS512',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    PoliceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthMapper],
})
export class AuthModule {}
