import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  name: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  lastname1: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  lastname2: string;
  @Column({ type: 'varchar', nullable: false, unique: true })
  dni: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  direction: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  zipcode: string;
  @Column({ type: 'varchar', nullable: false, unique: false })
  town: string;
  //Columna que indica si posee una multa
  @Column({ type: 'boolean', default: false })
  hasFines: boolean;
  @Column({ unique: true, length: 255, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Vehicle, (Vehicle) => Vehicle.user, { eager: false })
  vehicles: Vehicle[];

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
  @OneToMany(() => UserRole, (userRole) => userRole.user, { eager: true })
  roles: UserRole[];
  get roleNames(): string[] {
    return this.roles.map((role) => role.role);
  }
}
