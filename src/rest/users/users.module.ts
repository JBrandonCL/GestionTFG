import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BcryptServices } from './bcrypt.services';
import { UserRole } from './entities/user-role.entity';
import { UsersMapper } from './mapper/users.mapper';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FinesHistory } from './entities/user-finesHistory';
import { FinesService } from './fines.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    TypeOrmModule.forFeature([FinesHistory]),
    VehiclesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, BcryptServices, UsersMapper, FinesService],
  exports: [UsersService, FinesService,BcryptServices],
})
export class UsersModule {}
