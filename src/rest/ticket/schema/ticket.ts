import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { UsuarioSchema } from './usuario.schema';
import { PoliceSchema } from './police.schema';
import { VehicleSchema } from './vehicle.schema';
import { v4 as uuidv4 } from 'uuid';
import { Decimal128 } from 'typeorm';
@Schema({
  collection: 'tickets',
  timestamps: false,
  versionKey: false,
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      delete ret._class;
    },
  },
})
export class Ticket {
  /**
   * El usuario que recibe la multa
   */
  @Prop({
    required: true,
  })
  usuario: UsuarioSchema;
  /**
   * El policía que multa
   */
  @Prop({
    required: true,
  })
  police: PoliceSchema;
  /**
   * El vehículo al que se le pone la multa
   */
  @Prop({
    required: true,
  })
  vehicle: VehicleSchema;
  /**
   * La razón por la que se pone la multa
   */
  @Prop({
    required: true,
    type: String,
  })
  reason: string;
  /**
   * Motivo de la multa explicada
   */
  @Prop({
    required: false,
    type: String,
  })
  description: string;
  /**
   * La fecha en la que se pone la multa
   */
  @Prop({ default: Date.now })
  createdAt: Date;
  /**
   * Tiempo maximo en el que es posible modificar la multa
   */
  @Prop({
    default: () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 15);
      return date;
    },
  })
  limitModTime: Date;
  /**
   * Si la multa ha sido pagada
   */
  @Prop({
    required: true,
    default: false,
  })
  paid: boolean;
  /**
   * Numero de referencia de la multa
   */
  @Prop({
    required: true,
    type: String,
    default: uuidv4,
  })
  referenceNumber: string;
  /**
   * El precio de la multa
   */
  @Prop({
    required: true,
    type: Number ,
    default: 1,
  })
  finesImport: number;
}
export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.plugin(mongoosePaginate);

export type TicketDocument = Ticket & Document;
