import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);

  const prismaService = app.get(PrismaService);

  const dbConnected = await testDatabaseConnection(prismaService, app);
  if (!dbConnected) {
    return;
  }

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('FXQL Parser API')
    .setDescription('API for parsing and validating FXQL statements')
    .setVersion('1.0')
    .addTag('fxql-statements')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

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
