import { IsString, IsArray, IsEnum } from 'class-validator';

export enum ExportFormat {
    CSV = 'csv',
    EXCEL = 'excel'
}

export class SaveCVListDto {
    @IsString()
    name: string;

    @IsEnum(ExportFormat)
    format: ExportFormat;

    @IsArray()
    cvs: any[];
}
