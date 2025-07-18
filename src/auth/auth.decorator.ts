import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard'; 

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard), 
  );
}   
	