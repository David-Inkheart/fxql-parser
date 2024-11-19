import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  const prismaService = app.get(PrismaService);
  prismaService.$queryRaw`SELECT 1`
    .then(() => console.log('Database connected successfully!'))
    .catch((err) => console.error('Database connection failed:', err));
}
bootstrap();
