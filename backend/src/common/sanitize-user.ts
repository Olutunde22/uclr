import { User } from '../modules/users/entities/user.entity';
export function sanitizeUser(user: User): User {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest as User;
}
