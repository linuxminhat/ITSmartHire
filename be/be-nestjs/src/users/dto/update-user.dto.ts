// import { OmitType, PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';

// export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) {
//     _id: string;
// }

import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Sử dụng PartialType để làm các trường kế thừa từ CreateUserDto (trừ password) thành tùy chọn
// Sử dụng OmitType để loại bỏ trường password không cần thiết cho update
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password'] as const)
) {
    // Xóa trường _id vì ID được lấy từ Param, không phải từ Body
    // Các trường name, email, age, gender, address, role giờ đây là optional do dùng PartialType
}