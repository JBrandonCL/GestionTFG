import { Prop } from '@nestjs/mongoose';

export class UsuarioSchema {
  @Prop({ required: true, type: String, length: 255 })
  name: string;
  @Prop({ required: true, type: String, length: 255 })
  lastname1: string;
  @Prop({ required: true, type: String, length: 255 })
  lastname2: string;
  @Prop({ required: true, type: String, length: 255, unique: true })
  dni: string;
  @Prop({ required: true, type: String, length: 255 })
  direction: string;
  @Prop({ required: true, type: String, length: 255 })
  zipcode: string;
  @Prop({ required: true, type: String, length: 255 })
  town: string;
  @Prop({ required: true, type: String, length: 255, unique: true })
  email: string;
}
