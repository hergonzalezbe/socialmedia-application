import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando Seeding...');
  const salt = await bcrypt.genSalt(10);
  const passwordA = await bcrypt.hash('pass123', salt);
  const passwordB = await bcrypt.hash('pass456', salt);

  const userA = await prisma.user.create({
    data: {
      username: 'hernan_alias',
      password: passwordA,
      firstName: 'hernan',
      lastName: 'gonzalez',
      birthDate: new Date('1990-01-01T00:00:00.000Z'),
      posts: { create: [{ message: 'Primer post hernan.' }] },
    },
  });

  const userB = await prisma.user.create({
    data: {
      username: 'angie_alias',
      password: passwordB,
      firstName: 'angie',
      lastName: 'vivas',
      birthDate: new Date('1990-05-15T00:00:00.000Z'),
      posts: { create: [{ message: 'Segundo post de prueba.' }] },
    },
  });
  
  const hernanPost = await prisma.post.findFirst({ where: { authorId: userB.id } });
  if (hernanPost) {
      await prisma.like.create({
          data: { postId: hernanPost.id, userId: userA.id },
      });
  }

  console.log('Completado con 2 usuarios y publicaciones.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)    
  })
  .finally(async () => {
    await prisma.$disconnect()
  })