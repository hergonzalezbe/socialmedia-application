import 'dotenv/config'; 
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { protect, AuthRequest } from './middleware/auth'; 
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./swagger.yaml');

class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json()); 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new HttpError('Faltan credenciales.', 400));
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {      
      return next(new HttpError('Usuario o contraseña inválidos.', 401));
    }

    // Generación de JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!, 
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error durante el login:', error);    
    return next(new HttpError('Error interno del servidor.', 500));
  }
});

// middleware usuario autenticado
app.get('/profile', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {    
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                username: true,
                firstName: true,
                lastName: true,
                birthDate: true,
            }
        });

        if (!user) {
            return next(new HttpError('Perfil de usuario no encontrado.', 404));
        }
        
        const profileData = {
            ...user,
            birthDate: user.birthDate.toISOString().split('T')[0] 
        };

        res.json(profileData);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return next(new HttpError('Error al recuperar el perfil.', 500));
    }
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {  
  const status = err.statusCode || 500;
  const message = err.message || 'Ocurrió un error';
  res.status(status).json({
    status: 'error',
    message: message
  });
});

app.listen(PORT, () => {
  console.log(`Auth Service corriendo en el puerto ${PORT}`);
});