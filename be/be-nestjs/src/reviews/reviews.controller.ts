import { Controller, Post, Body, UseGuards, Get, Param, Req, Res } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

import { IUser } from 'src/users/users.interface';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: any, @Res() res: Response) {
    const user: IUser = req.user;
    const review = await this.reviewsService.create(createReviewDto, user);
    return res.status(201).json(review);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string, @Res() res: Response) {
    const reviews = await this.reviewsService.findByCompany(companyId);
    return res.status(200).json(reviews);
  }
}
