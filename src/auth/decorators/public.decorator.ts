import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (no requiere JWT).
 * Se usa en /auth/register y /auth/login, ya que el JwtAuthGuard
 * se registra de forma global para toda la aplicación.
 *
 * Ejemplo: @Public() @Post('login') login(...) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
