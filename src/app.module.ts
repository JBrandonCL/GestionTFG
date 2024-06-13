import { Module } from '@nestjs/common';
import { DatabaseProviders } from './Config/database/databaseProviders';
import { UsersModule } from './rest/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './rest/auth/auth.module';
import { VehiclesModule } from './rest/vehicles/vehicles.module';
import { TicketModule } from './rest/ticket/ticket.module';
import { CorsModule } from './Config/cors/cors.module';
import { PoliceModule } from './rest/police/police.module';
import { EmailProviders } from './Config/email/emailProviders';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    DatabaseProviders,
    CorsModule,
    AuthModule,
    UsersModule,
    TicketModule,
    VehiclesModule,
    PoliceModule,
    EmailProviders,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
