import { Request } from 'express';

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}
