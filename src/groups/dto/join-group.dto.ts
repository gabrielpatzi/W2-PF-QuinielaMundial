import { IsNotEmpty, IsString } from 'class-validator';

export class JoinGroupDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de invitación es obligatorio' })
  invitationCode: string;
}
