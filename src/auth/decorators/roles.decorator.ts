import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a uno o más roles.
 * Ejemplo: @Roles(Role.ADMIN) @Post('matches') createMatch(...) { ... }
 * Requiere que RolesGuard esté activo (se registra globalmente en AppModule).
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
