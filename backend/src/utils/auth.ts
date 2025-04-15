import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'your_jwt_secret_here',
    { expiresIn: '24h' }
  );
}; 