import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

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
