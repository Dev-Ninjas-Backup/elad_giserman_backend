import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetReviewDto } from '../dto/getReview.dto';

@Injectable()
export class AdminReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all reviews
  async getReviews(filter: GetReviewDto) {
    const { page, limit, search } = filter;
    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { businessProfile: { title: { contains: search } } },
      ];
    }
    const adminReviewPagination: { skip?: number; take?: number } = {};
    if (limit) {
      adminReviewPagination.take = Number(limit);
      adminReviewPagination.skip = ((Number(page) || 1) - 1) * Number(limit);
    }
    try {
      const result = await this.prisma.client.review.findMany({
        where,
        ...adminReviewPagination,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          businessProfile: {
            select: {
              title: true,
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  // delete review  by admin
  async deleteReview(id: string) {
    if (!id) {
      throw new NotFoundException('user id is required');
    }
    const isExistReivew = await this.prisma.client.review.findUnique({
      where: {
        id: id,
      },
    });
    if (!isExistReivew) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.client.review.delete({
      where: { id },
    });
    return {
      status: HttpStatus.ACCEPTED,
      messge: 'reivew delete successfull',
    };
  }
}
