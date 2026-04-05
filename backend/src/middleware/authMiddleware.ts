import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            
            // Check if user still exists (handles DB clearing)
            const user = await import('../models/User').then(m => m.User.findById((decoded as any).id));
            if (!user) {
                return res.status(401).json({ message: 'User no longer exists, token invalid' });
            }
            
            (req as any).user = { id: user._id, role: user.role };
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Optional auth: attach user if token exists, otherwise continue
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await import('../models/User').then(m => m.User.findById((decoded as any).id));
            if (user) {
                (req as any).user = { id: user._id, role: user.role };
            }
        } catch {
            // ignore invalid token for optional auth
        }
    }
    next();
};
