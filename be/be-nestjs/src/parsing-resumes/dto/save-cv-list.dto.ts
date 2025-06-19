import { IsString, IsArray, IsEnum } from 'class-validator';

//Defines the file formats that can be exported
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
