import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import * as bcrypt from 'bcryptjs';
import { AuthMapper } from './mapper/auth.mapper';
import { PoliceService } from '../police/police.service';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly authMapper: AuthMapper,
    private readonly policeService: PoliceService,
  ) {}

  async register(user: UserRegisterDto) {
    this.logger.log(
      `Registering user with the next data: ${JSON.stringify(user)}`,
    );
    if(await this.policeService.findByDNI(user.dni)==null && await this.usersService.findOne(user.dni)==null){
    const users = this.authMapper.toCreate(user);
    const userCreate = await this.usersService.create(users);
    return this.getAccessToken(userCreate.dni);
    }
    throw new BadRequestException('Ya existe un usuario con ese DNI en la base de datos');
  }

  private getAccessToken(userDni: string,role?:string,name?:string) {
    this.logger.log(`getAccessToken ${userDni}`);
    try {
      const payload = {
        dni: userDni,
      };
      //console.log(payload)
      const access_token = this.jwtService.sign(payload,{expiresIn:'1h'});
      return {
        access_token,role,name
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Ha surgido un error');
    }
  }

  async login(user: UserLoginDto) {
    this.logger.log(
      'Trying to log with the next data: ' + JSON.stringify(user),
    );
    if (!user.username && !user.email) {
      throw new BadRequestException('Debe ingresar un email o un usuario');
    }
    //Si el usuario contiene police.
    if(user.username && user.username.startsWith('police.')){
      this.logger.log('Police login');
      //Si tiene el prefijo police, se busca
      const policeLogin= await this.policeService.searchingByUserEmailDni(user.username,null,null);
      this.logger.log(`Police login ${JSON.stringify(policeLogin)}`);
      if(!policeLogin){
        throw new BadRequestException('Algo salio mal con el usuario, intente de nuevo');
      }
      const police= await this.policeService.findByUsername(user.username);
      this.logger.log(`Police who found is  ${JSON.stringify(police)}`);
      const same = await bcrypt.compare(user.password, police.password);
      if(same){
        this.logger.log(`Police was the same password ${JSON.stringify(police)}`);
        if(police.roleNames.includes('ADMIN')){
          return this.getAccessToken(police.dni,'ADMIN',police.name);
        }else if(police.roleNames.includes('ADMINISTRACION')){
          return this.getAccessToken(police.dni,'ADMINISTRACION',police.name);
        }else{
          return this.getAccessToken(police.dni,'POLICE',police.name);
        }
      }
      throw new BadRequestException(
        'Algo salio mal con el usuario o la contraseña, intente de nuevo',
      );
    }
    const userLogin = await this.usersService.searchingByUserEmailDni(
      user.username,
      user.email,
      null,
    );
    if(Object.keys(userLogin).length===0){
      throw new BadRequestException('Algo salio mal con el email o el usuario, intente de nuevo');
    }
    if (userLogin.email) {
      const userRegister = await this.usersService.findByEmail(user.email);
      if(userRegister.isDeleted==false){
      const same = await bcrypt.compare(user.password, userRegister.password);
      if (same) {
        return this.getAccessToken(userRegister.dni,'USER',userRegister.name);
      }
      throw new BadRequestException(
        'Algo salio mal con el email o la contraseña, intente de nuevo',
      );
    }else{
      throw new BadRequestException('El usuario esta eliminado, por favor contacte con el administrador');
    }
    }
    if (userLogin.username) {
      const userRegister = await this.usersService.findByUsername(
        user.username,
      );
      if(userRegister.isDeleted==false){
      const same = await bcrypt.compare(user.password, userRegister.password);
      if (same) {
        return this.getAccessToken(userRegister.dni,'USER',userRegister.name);
      } else {
        throw new BadRequestException(
          'Algo salio mal con el usuario o la contraseña, intente de nuevo',
        );
      }
    }else{
      throw new BadRequestException('El usuario esta eliminado, por favor contacte con el administrador');
    }
    }
  }
  async validateUser(dni: string) {
    this.logger.log(`validateUser ${dni}`);
    const user= await this.usersService.findOne(dni);
    if(user){
      return user;
    }else{
      const police= await this.policeService.findByDNI(dni);
      if(police){
        return police;
    }else{
      throw new BadRequestException('Algo salio mal con el usuario o el correo, intente de nuevo');
    }
  }
}
}
