import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../modules/roles/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { UsersModule } from '../../modules/users/users.module';
import { User } from '../../modules/users/entities/user.entity';
import { BootstrapService } from './bootstrap.service';
@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, User]), UsersModule],
  providers: [BootstrapService],
})
export class BootstrapModule {}
