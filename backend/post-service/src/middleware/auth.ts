import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interfaz adjuntar el userId al request
export interface AuthRequest extends Request {
    userId?: number;
}

class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return next(new HttpError('Acceso denegado. Se requiere autenticación.', 401));
    }

    try {
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

        req.userId = decoded.userId;

        next();
    } catch (error) {        
        return next(new HttpError('Token inválido o expirado.', 401));
    }
};

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err as any).statusCode || 500;
    console.error(`[ERROR ${statusCode}]: ${(err as any).message}`);
    res.status(statusCode).json({
        status: 'error',
        message: (err as any).message || 'Error interno del servidor.'
    });
};