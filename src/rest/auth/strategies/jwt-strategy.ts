import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'Contrasena_Ultra_Secreta',
        'utf-8',
      ).toString('base64'), 
    });
  }
  async validate(payload: any) {
    const id = payload.dni;
    return await this.authService.validateUser(id);
  }
}
