import { IsIn, IsNotEmpty, IsString } from 'class-validator';

// Define allowed statuses - Add 'offered'
const allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected', 'offered'];

export class UpdateApplicationStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là dạng chuỗi' })
  @IsIn(allowedStatuses, { message: `Trạng thái phải là một trong các giá trị: ${allowedStatuses.join(', ')}` })
  status: string;
} 