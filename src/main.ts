import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv'; // Import dotenv

// Khai báo module cho Hot Module Replacement (HMR)
// Điều này giúp TypeScript nhận diện `module.hot`
declare const module: {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};

// Tải biến môi trường từ file .env ngay từ đầu
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Đặt tiền tố /api cho tất cả các endpoint (theo spec RealWorld)
  app.setGlobalPrefix('api');

  // Áp dụng global pipe cho validation
  // `whitelist: true` sẽ loại bỏ bất kỳ thuộc tính nào không được định nghĩa trong DTO
  // `forbidNonWhitelisted: true` sẽ ném lỗi nếu có thuộc tính không được định nghĩa
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Cấu hình CORS để cho phép client frontend truy cập
  app.enableCors({
    origin: '*', // Thay bằng domain của frontend nếu có (ví dụ: 'http://localhost:4200')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    credentials: true, // Cho phép gửi cookies và header xác thực
  });

  // Đọc cổng từ biến môi trường PORT hoặc mặc định là 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Log thông báo ứng dụng đang chạy
  console.log(`Application is running on: http://localhost:${port}/api`);

  // Cấu hình Hot Module Replacement (HMR)
  // Điều này cho phép ứng dụng tự động reload khi có thay đổi code mà không cần khởi động lại toàn bộ server
  if (module.hot) {
    module.hot.accept(); // Chấp nhận các cập nhật module
    module.hot.dispose(() => {
      // Đóng ứng dụng một cách gọn gàng trước khi module mới được tải
      void app.close();
    });
  }
}

// Gọi hàm bootstrap để khởi động ứng dụng và bắt lỗi nếu có
bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
});
