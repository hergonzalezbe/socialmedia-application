import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir el userId
export interface AuthRequest extends Request {
    userId?: number;
}

// Clase de error personalizada para el manejo global
class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Verificar y adjuntar el ID del usuario
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Obtener el token del header (Bearer Token)
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        // 401: No Autorizado
        return next(new HttpError('Acceso denegado. No hay token o el formato es inválido.', 401));
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