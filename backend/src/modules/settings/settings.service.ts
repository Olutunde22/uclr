import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
  ) {}
  findAll(): Promise<SystemSetting[]> {
    return this.settings.find({ order: { key: 'ASC' } });
  }
  async get(key: string): Promise<string | undefined> {
    const row = await this.settings.findOne({ where: { key } });
    return row?.value;
  }
  async set(key: string, value: string): Promise<SystemSetting> {
    let row = await this.settings.findOne({ where: { key } });
    if (!row) {
      row = this.settings.create({ key, value });
    } else {
      row.value = value;
    }
    return this.settings.save(row);
  }
}
