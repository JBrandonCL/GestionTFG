import { Module, forwardRef } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { Ticket } from './schema/ticket';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { TicketMapper } from './mapper/ticket.mapper';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FinesService } from '../users/fines.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Ticket.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Ticket);
          schema.plugin(mongoosePaginate);
          return schema;
        },
      },
    ]),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketMapper],
  exports: [TicketService],
})
export class TicketModule {}
