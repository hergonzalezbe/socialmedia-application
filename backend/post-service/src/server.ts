import 'dotenv/config';
import express, { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest, errorHandler } from './middleware/auth'; 
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());

try {
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
    console.warn("No se pudo cargar el archivo swagger.yaml.");
}
app.get('/', (req: AuthRequest, res: Response) => {
    res.json({ message: 'Post Service está online.' });
});

app.post('/posts', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { message } = req.body;
    const authorId = req.userId!; 
    
    if (!message) {
        return res.status(400).json({ status: 'error', message: 'Mensaje es obligatorio.' });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                message,
                authorId,
                publishedAt: new Date(), 
            },
            select: {
                id: true,
                message: true,
                publishedAt: true,
            }
        });
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Publicación exitosa.', 
            post: newPost 
        });
    } catch (error) {
        console.error('Error al crear publicación:', error);
        next(error);
    }
});

app.get('/posts', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { publishedAt: 'desc' }, 
            select: {
                id: true,
                message: true,
                publishedAt: true,
                author: { 
                    select: {
                        username: true,
                        firstName: true,
                    }
                },
                _count: { 
                    select: { likes: true }
                }
            }
        });

        const formattedPosts = posts.map(post => ({
            id: post.id,
            message: post.message,
            publishedAt: post.publishedAt.toISOString(),
            author: post.author.username,
            authorName: `${post.author.firstName}`,
            likeCount: post._count.likes,
        }));

        res.json({ posts: formattedPosts });

    } catch (error) {
        console.error('Error al listar publicaciones:', error);
        next(error);
    }
});

app.post('/posts/:postId/like', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.postId);
    const userId = req.userId!;

    if (isNaN(postId)) {
        return res.status(400).json({ status: 'error', message: 'ID de publicación inválido.' });
    }

    try {
        const like = await prisma.like.upsert({
            where: {
                postId_userId: {
                    postId,
                    userId,
                }
            },
            update: {}, 
            create: {
                postId,
                userId,
            },
        });

        const newLikeCount = await prisma.like.count({
            where: { postId }
        });

        res.json({ 
            status: 'success', 
            message: 'Like registrado con éxito.',
            likeCount: newLikeCount 
        });

    } catch (error: any) {
        if (error.code === 'P2003') { 
            return res.status(404).json({ status: 'error', message: 'La publicación especificada no existe.' });
        }
        console.error('Error al registrar like:', error);
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Post Service corriendo en el puerto ${PORT}`);
});