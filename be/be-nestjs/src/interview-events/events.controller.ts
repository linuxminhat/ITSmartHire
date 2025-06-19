import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  create(@Body() dto: CreateEventDto, @Request() req) {
    console.log('User payload:', req.user);
    console.log('Received DTO:', dto);
    return this.eventsService.create(dto, req.user._id);
  }

  //get a list of interview events that fall within a specific time period
  @Get()
  findRange(@Query('range') range: string, @Request() req) {
    const [start, end] = range.split('..');
    return this.eventsService.findRange(req.user._id, new Date(start), new Date(end));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(id, dto, req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user._id);
  }
  @Patch('reply/:id')
  reply(
    @Param('id') id: string,
    @Query('action') action: 'accepted' | 'declined',
  ) {
    return this.eventsService.update(id, { status: action }, undefined);
  }

}