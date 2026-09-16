export function postgresSsl():
  | false
  | {
      rejectUnauthorized: boolean;
    } {
  return process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;
}
