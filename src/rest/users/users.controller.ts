import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('USER')
  @Get('me/fines')
  async getMyFines(@Req() request: any) {
    return await this.usersService.searchFinesByUser(request.user.dni);
  }
  @Roles('USER')
  @Get('me/vehicles')
  async getMyVehicles(@Req() request: any) {
    return await this.usersService.findVehiclesByUser(request.user.dni);
  }
  @Roles('USER')
  @Get('me/update')
  async updateDetails(@Req() request: any) {
    return await this.usersService.updateDetails(request.user.dni);
  }
  @Roles('USER')
  @Patch('me/update')
  async update(@Req() request: any, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(request.user.dni, updateUserDto);
  }
  @Roles('USER')
  @Get('me/profile')
  async getMe(@Req() request: any) {
    return request.user;
  }
  @Roles('USER')
  @Get('me/my-email')
  async getMeEmail(@Req() request: any) {
    return {email:request.user.email};
  }
}
