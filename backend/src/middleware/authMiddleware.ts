import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { sendError } from '../utils/response';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CUSTOMER';
  status: 'ACTIVE' | 'SUSPENDED';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please login.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return sendError(res, 'User session invalid or user does not exist.', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account has been suspended by the administrator.', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'SUPER_ADMIN' | 'CUSTOMER',
      status: user.status as 'ACTIVE' | 'SUSPENDED',
    };

    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }
};

export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  if (req.user.role !== 'CUSTOMER' && req.user.role !== 'SUPER_ADMIN') {
    return sendError(res, 'Access denied. Customer account required.', 403);
  }
  return next();
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    return sendError(res, 'Access denied. Super Administrator privileges required.', 403);
  }
  return next();
};
