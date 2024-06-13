import { Module } from '@nestjs/common';
import { PoliceService } from './police.service';
import { PoliceController } from './police.controller';
import { Police } from './entities/police.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptServices } from '../users/bcrypt.services';
import { UserRole } from '../users/entities/user-role.entity';
import { TicketModule } from '../ticket/ticket.module';
import { UsersModule } from '../users/users.module';
import { PoliceMapper } from './mapper/police.mapper';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { EmailProviders } from 'src/Config/email/emailProviders';

@Module({
  imports: [TypeOrmModule.forFeature([Police]),TypeOrmModule.forFeature([UserRole]),TicketModule,UsersModule,VehiclesModule],
  controllers: [PoliceController],
  providers: [PoliceService,BcryptServices,PoliceMapper,EmailProviders],
  exports: [PoliceService],
})
export class PoliceModule {}
