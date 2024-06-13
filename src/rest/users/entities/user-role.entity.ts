import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Police } from 'src/rest/police/entities/police.entity';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  POLICE = 'POLICE',
  ADMINISTRACION = 'ADMINISTRACION',
}

@Entity({ name: 'user_roles' })
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 50, nullable: false, default: Role.USER })
  role: Role;
  @ManyToOne(() => User, (user) => user.roles,{nullable:true})
  @JoinColumn({ name: 'user_id' })
  user: User|null;

  @ManyToOne(() => Police, (police) => police.roles,{nullable:true})
  @JoinColumn({ name: 'police_id' })
  police: Police|null;
}
