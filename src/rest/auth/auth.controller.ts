import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createAuthDto: UserRegisterDto) {
    return await this.authService.register(createAuthDto);
  }
  @Post('login')
  async login(@Body() userLogin: UserLoginDto) {
    return await this.authService.login(userLogin);
  }
}
