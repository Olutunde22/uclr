import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppConfig } from '../config/configuration';
import { postgresSsl } from './ssl';
import { entities } from './entities';
const logger = new Logger('DatabaseModule');
function describeDbUrl(url: string | undefined): string {
  if (!url) return '<missing url>';
  try {
    const { hostname, port, pathname } = new URL(url);
    return `${hostname}:${port || '5432'}${pathname}`;
  } catch {
    return '<unparseable url>';
  }
}
async function createLoggedDataSource(
  options: DataSourceOptions,
): Promise<DataSource> {
  const target = describeDbUrl(
    (
      options as {
        url?: string;
      }
    ).url,
  );
  logger.log(`Connecting to DB (${target})...`);
  const dataSource = new DataSource(options);
  try {
    await dataSource.initialize();
    logger.log(`DB connected (${target})`);
    return dataSource;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`DB connection FAILED (${target}): ${message}`);
    throw err;
  }
}
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: config.get('databaseUrl', { infer: true }),
        entities,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
        ssl: postgresSsl(),
      }),
      dataSourceFactory: (options) =>
        createLoggedDataSource(options as DataSourceOptions),
    }),
  ],
})
export class DatabaseModule {}
