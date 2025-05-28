import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';


export class UpdateJobDto extends PartialType(CreateJobDto) { }
