import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {
        console.log('🚀 CommentsController initialized');
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ResponseMessage("Create comment")
    create(@Body() createCommentDto: CreateCommentDto, @User() user: IUser) {
        console.log('📝 POST /api/v1/comments called with:', createCommentDto);
        console.log('👤 User from decorator:', JSON.stringify(user));

        if (!user || !user._id) {
            throw new UnauthorizedException('Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
        }

        return this.commentsService.create(createCommentDto, user);
    }

    @Get('company/:companyId')
    @ResponseMessage("Get comments by company")
    async findByCompany(@Param('companyId') companyId: string) {
        console.log('🔍 GET /api/v1/comments/company/:companyId called with:', companyId); // Debug log
        const comments = await this.commentsService.findByCompany(companyId);
        return {
            result: comments
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage("Delete comment")
    remove(@Param('id') id: string, @User() user: IUser) {
        console.log('🗑️ DELETE /api/v1/comments/:id called with:', id); // Debug log
        return this.commentsService.remove(id, user);
    }
}