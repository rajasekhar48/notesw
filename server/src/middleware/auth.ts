// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/User';

interface AuthRequest extends Request {
  user?: any; // we attach full User object (from DB) here
}

interface JwtPayload {
  id?: string;
  userId?: string; // support both payload shapes
  email?: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Support both "Authorization: Bearer TOKEN" and a raw token in header
    const authHeader = req.header('Authorization') || req.header('authorization') || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader.trim();

    // Also allow token sent in 'x-access-token' or 'token' headers if needed
    const altToken = (req.header('x-access-token') || req.header('token') || '').toString().trim();

    const token = tokenFromHeader || altToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      // Handle token-specific errors separately
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expired.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // Support tokens that use either `id` or `userId` in payload
    const userId = decoded?.id ?? decoded?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    // Attach the full user object to the request (you can change to user.id / user._id if you prefer)
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};
