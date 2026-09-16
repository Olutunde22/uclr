import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { postgresSsl } from './ssl';
import { entities } from './entities';
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: postgresSsl(),
});
