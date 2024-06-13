import { UserRole } from 'src/rest/users/entities/user-role.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Polices' })
export class Police {
  /**
   * Identificación unica del agente
   */
  @PrimaryGeneratedColumn('uuid')
  identification: string;
  /**
   * Nombre del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  name: string;
  /**
   * Primer apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  lastname1: string;
  /**
   * Segundo apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  lastname2: string;
  /**
   * Segundo apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  dni: string;
  /**
   * Columna que indica si el agente ha sido eliminado
   */
  @Column({ type: 'boolean' ,nullable: false, default: false})
  isDeleted: boolean;
  /**
   * Primer apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  password: string;
  /**
   * Primer apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  username: string; 
  /**
   * Primer apellido del agente
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  email: string;

  @OneToMany(() => UserRole, (userRole) => userRole.police, { eager: true })
  roles: UserRole[];
  
  get roleNames(): string[] {
    return this.roles.map((role) => role.role);
  }
}
