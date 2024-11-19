import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(FxqlModule);

  app.enableCors();

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);

    const prismaService = app.get(PrismaService);
    prismaService.$queryRaw`SELECT 1`
      .then(() => console.log('Database connected successfully!'))
      .catch((err) => console.error('Database connection failed:', err));
  });
}
bootstrap();
