export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: number;
    refreshTtl: number;
  };
  cookieSecure: boolean;
  cookieDomain?: string;
  cookieNames: {
    access: string;
    refresh: string;
  };
  bootstrapAdmin: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}
export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '1209600', 10),
  },
  cookieSecure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieNames: {
    access: process.env.COOKIE_ACCESS_NAME ?? 'ulcrs_ac_tk',
    refresh: process.env.COOKIE_REFRESH_NAME ?? 'ulcrs_re_tk',
  },
  bootstrapAdmin: {
    email: process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@ulcrs.edu.ng',
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe123!',
    firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME ?? 'System',
    lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? 'Admin',
  },
});
