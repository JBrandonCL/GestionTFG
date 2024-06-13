import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { ResponseUserDto } from '../dto/response-user.dto';
import { plainToClass } from 'class-transformer';
import { UserRole } from '../entities/user-role.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersMapper {
  toEntity(createUser: CreateUserDto): User {
    return plainToClass(User, createUser);
  }
  toResponse(user: User, roles?: UserRole[]): ResponseUserDto {
    const responseUser: ResponseUserDto = new ResponseUserDto();
    responseUser.name = user.name;
    responseUser.lastname1 = user.lastname1;
    responseUser.lastname2 = user.lastname2;
    responseUser.dni = user.dni;
    responseUser.direction = user.direction;
    responseUser.zipcode = user.zipcode;
    responseUser.town = user.town;
    responseUser.hasFines = user.hasFines;
    responseUser.username = user.username;
    responseUser.email = user.email;
    responseUser.createdAt = user.createdAt;
    responseUser.isDeleted = user.isDeleted;
    responseUser.fullName = `${user.name} ${user.lastname1} ${user.lastname2}`;
    return responseUser;
  }
  toUserUpdate(user: UpdateUserDto,original:User): User {
    const update= new User();
    update.id=original.id;
    update.name = original.name;
    update.lastname1 = original.lastname1;
    update.lastname2 = original.lastname2;
    update.dni = original.dni;
    update.direction = user.direction;
    update.zipcode = user.zipcode;
    update.town = user.town;
    update.hasFines = original.hasFines;
    update.username = user.username;
    update.email = user.email;
    update.password = user.password?user.password:original.password;
    update.createdAt = original.createdAt;
    update.isDeleted = user.isDeleted?user.isDeleted:original.isDeleted;
    return update;
  }
}
