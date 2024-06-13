import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER || 'admin',
        password: process.env.DATABASE_PASSWORD || 'admin',
        database: process.env.POSTGRES_DATABASE || 'gestion',
        autoLoadEntities: true,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: `mongodb://${process.env.DATABASE_USER}:${
          process.env.DATABASE_PASSWORD
        }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${
          process.env.MONGO_DATABASE
        }`,
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log(
            `MongoDB readyState: ${connection.readyState}`,
            'DatabaseModule',
          );
          return connection;
        },
      }),
    }),
  ],
  exports: [TypeOrmModule, MongooseModule],
})
export class DatabaseProviders {}
