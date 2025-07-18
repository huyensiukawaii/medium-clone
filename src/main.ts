import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv'; 


declare const module: {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);

  if (module.hot) {
    module.hot.accept(); 
    module.hot.dispose(() => {
      void app.close();
    });
  }
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
});

