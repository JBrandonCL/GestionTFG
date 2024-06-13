import { forwardRef, Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { VehicleMapper } from './mapper/vehicle.mapper';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleMapper],
  exports: [VehiclesService],
})
export class VehiclesModule {}
