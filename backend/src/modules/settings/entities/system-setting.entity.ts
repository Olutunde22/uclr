import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
@Entity({ name: 'system_settings' })
export class SystemSetting {
  @PrimaryColumn()
  key: string;
  @Column()
  value: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
