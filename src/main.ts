import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);

  const prismaService = app.get(PrismaService);

  const dbConnected = await testDatabaseConnection(prismaService, app);
  if (!dbConnected) {
    return;
  }

  await app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
  });
}

async function testDatabaseConnection(prismaService: PrismaService, app: any) {
  try {
    await prismaService.$queryRaw`SELECT 1`;
    console.log('Database connected successfully!');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    await app.close();
    return false;
  }
}

bootstrap();
