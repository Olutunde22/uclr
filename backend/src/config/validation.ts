import * as Joi from 'joi';
export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  JWT_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_TTL: Joi.number().default(1209600),
  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  COOKIE_DOMAIN: Joi.string().allow('').optional(),
  COOKIE_ACCESS_NAME: Joi.string().default('ulcrs_ac_tk'),
  COOKIE_REFRESH_NAME: Joi.string().default('ulcrs_re_tk'),
  BOOTSTRAP_ADMIN_EMAIL: Joi.string().email().default('admin@ulcrs.edu.ng'),
  BOOTSTRAP_ADMIN_PASSWORD: Joi.string().default('ChangeMe123!'),
  BOOTSTRAP_ADMIN_FIRST_NAME: Joi.string().default('System'),
  BOOTSTRAP_ADMIN_LAST_NAME: Joi.string().default('Admin'),
});
