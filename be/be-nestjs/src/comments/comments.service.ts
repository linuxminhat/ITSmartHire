import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) { }

    async create(createCommentDto: CreateCommentDto, user: IUser) {
        const newComment = new this.commentModel({
            ...createCommentDto,
            userId: user._id,
            createdBy: user._id
        });

        const savedComment = await newComment.save();

        // Populate thông tin user ngay sau khi tạo
        // Đây là bước quan trọng để đảm bảo dữ liệu trả về là đầy đủ
        const populatedComment = await this.commentModel
            .findById(savedComment._id)
            .populate({
                path: 'userId',
                select: 'name email' // Chỉ lấy name và email
            })
            .exec();

        return populatedComment;
    }

    async findByCompany(companyId: string) {
        try {
            console.log('Finding comments for company:', companyId);

            const comments = await this.commentModel
                .find({ companyId, isDeleted: false })
                .populate({
                    path: 'userId',
                    select: 'name email'
                })
                .sort({ createdAt: -1 })
                .exec();

            console.log('Found comments:', comments.length);
            console.log('Comments data:', comments);

            return comments; // Return array directly, not wrapped in object
        } catch (error) {
            console.error('Error in findByCompany:', error);
            throw error;
        }
    }

    async remove(id: string, user: IUser) {
        const comment = await this.commentModel.findById(id);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const isOwner = comment.userId.toString() === user._id.toString();
        // Giả định user object có chứa role.name
        const isAdmin = user.role && user.role.name === 'ADMIN';

        // Chỉ cho phép xóa nếu là chủ sở hữu hoặc là Admin
        if (!isOwner && !isAdmin) {
            throw new BadRequestException('Bạn không có quyền xóa bình luận này.');
        }

        comment.isDeleted = true;
        comment.deletedAt = new Date();
        await comment.save();

        return { message: 'Comment deleted successfully' };
    }
}