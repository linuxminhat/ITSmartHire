import { IsArray, ArrayMaxSize } from 'class-validator';

export class UploadAndParseDto {
    @IsArray()
    @ArrayMaxSize(10)
    cvs: any[];
}
