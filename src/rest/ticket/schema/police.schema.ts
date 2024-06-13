import { Prop } from '@nestjs/mongoose';

export class PoliceSchema {
  @Prop({ required: true, type: String, length: 255 })
  name: string;
  @Prop({ required: true, type: String, length: 255 })
  lastname1: string;
  @Prop({ required: true, type: String, length: 255 })
  lastname2: string;
  @Prop({ required: true, type: String, length: 255, unique: true })
  identification: string;
}
