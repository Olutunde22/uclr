import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/configuration';
import { Permission } from '../../modules/roles/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { hashPassword } from '../../common/password';
import {
  ALL_PERMISSIONS,
  SEEDED_ROLE_PERMISSIONS,
  SYSTEM_ADMIN_ROLE,
} from '../../common/permissions';
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);
  constructor(
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}
  async onApplicationBootstrap(): Promise<void> {
    await this.seedPermissions();
    const systemAdminRole = await this.seedRoles();
    await this.seedBootstrapAdmin(systemAdminRole);
  }
  private async seedPermissions(): Promise<void> {
    await this.permissions.upsert(
      ALL_PERMISSIONS.map((def) => ({
        key: def.key,
        description: def.description,
      })),
      ['key'],
    );
  }
  private async seedRoles(): Promise<Role> {
    const allPerms = await this.permissions.find();
    const byKey = new Map(allPerms.map((p) => [p.key, p]));
    let systemAdminRole: Role | undefined;
    for (const [name, keys] of Object.entries(SEEDED_ROLE_PERMISSIONS)) {
      const isSystemAdmin = name === SYSTEM_ADMIN_ROLE;
      const perms = isSystemAdmin
        ? allPerms
        : keys.map((k) => byKey.get(k)).filter((p): p is Permission => !!p);
      let role = await this.roles.findOne({ where: { name } });
      if (!role) {
        role = this.roles.create({ name, permissions: perms });
      } else {
        role.permissions = perms;
      }
      role = await this.roles.save(role);
      if (isSystemAdmin) systemAdminRole = role;
    }
    if (!systemAdminRole) {
      systemAdminRole = await this.roles.findOneOrFail({
        where: { name: SYSTEM_ADMIN_ROLE },
      });
    }
    return systemAdminRole;
  }
  private async seedBootstrapAdmin(systemAdminRole: Role): Promise<void> {
    const { email, password, firstName, lastName } = this.config.get(
      'bootstrapAdmin',
      { infer: true },
    );
    const existing = await this.users.findOne({ where: { email } });
    if (existing) return;
    const user = this.users.create({
      email,
      firstName,
      lastName,
      passwordHash: await hashPassword(password),
      roles: [systemAdminRole],
      isActive: true,
    });
    await this.users.save(user);
    this.logger.log(`Bootstrap system_admin ensured: "${email}"`);
  }
}
