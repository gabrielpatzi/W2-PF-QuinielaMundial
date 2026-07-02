import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// El requerimiento 4 dice "Un usuario podrá consultar y modificar su
// información personal": se omite password aquí (tendría su propio endpoint
// de cambio de contraseña con validación de contraseña actual).
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
