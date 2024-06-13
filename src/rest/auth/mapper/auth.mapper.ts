import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from '../dto/user-register.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { plainToClass } from 'class-transformer';
import { Role } from '../../users/entities/user-role.entity';

@Injectable()
export class AuthMapper {
  toCreate(register: UserRegisterDto): CreateUserDto {
    const userToCreate = plainToClass(CreateUserDto, register);
    userToCreate.roles = [Role.USER];
    return userToCreate;
  }
}
