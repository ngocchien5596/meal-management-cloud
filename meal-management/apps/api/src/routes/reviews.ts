import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

/**
 * POST /api/reviews
 * Submit a new meal evaluation
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { date, mealType, comment, images, isAnonymous, rating } = req.body;

        if (comment && comment.length > 500) {
            return res.status(400).json({ success: false, error: 'Bình luận tối đa 500 ký tự' });
        }
        const employeeId = req.user!.employeeId;

        console.log('[REVIEWS] Creating review with rating:', rating, typeof rating);

        // Normalize date to 00:00:00 to match DB
        const mealDate = new Date(date);
        // mealDate is already UTC 00:00 from new Date("YYYY-MM-DD")
        // Do NOT setHours(0,0,0,0) as it shifts to Local 00:00 (which might be prev day UTC)

        // Find meal event
        const mealEvent = await prisma.mealEvent.findUnique({
            where: {
                mealDate_mealType: {
                    mealDate,
                    mealType
                }
            }
        });

        if (!mealEvent) {
            return res.status(403).json({
                success: false,
                error: 'Bạn chưa check-in bữa ăn này nên không thể gửi đánh giá.'
            });
        }

        // Validate Check-in: Only allow review if employee has checked in
        const hasCheckedIn = await prisma.checkinLog.findUnique({
            where: {
                mealEventId_employeeId: {
                    mealEventId: mealEvent.id,
                    employeeId
                }
            }
        });

        if (!hasCheckedIn) {
            return res.status(403).json({
                success: false,
                error: 'Bạn chưa check-in bữa ăn này nên không thể gửi đánh giá.'
            });
        }

        const review = await prisma.mealReview.create({
            data: {
                mealEventId: mealEvent.id,
                employeeId,
                comment,
                rating: rating !== undefined ? Number(rating) : 5,
                images: images || [],
                isAnonymous: isAnonymous !== undefined ? isAnonymous : true
            },
            include: {
                employee: {
                    select: {
                        fullName: true,
                        employeeCode: true
                    }
                }
            }
        });

        // Real-time update via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('new-review', {
                mealEventId: mealEvent.id,
                review: {
                    ...review,
                    // Hide employee info if anonymous
                    employeeName: review.isAnonymous ? 'Người dùng ẩn danh' : review.employee.fullName,
                    employee: review.isAnonymous ? null : review.employee
                }
            });
        }

        console.log('[REVIEWS] Final review object sent to client:', JSON.stringify(review, null, 2));

        res.json({
            success: true,
            data: review
        });
    } catch (error: any) {
        console.error('Review creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi gửi đánh giá.',
            message: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * PATCH /api/reviews/:id/reply
 * Admin replies to a review
 */
router.patch('/:id/reply', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || reply.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Nội dung phản hồi không được để trống.'
            });
        }

        const review = await prisma.mealReview.update({
            where: { id },
            data: {
                adminReply: reply,
                adminReplyAt: new Date()
            },
            include: {
                employee: {
                    select: {
                        fullName: true,
                        employeeCode: true
                    }
                },
                mealEvent: true
            }
        });

        // Real-time update via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('update-review', {
                review: {
                    ...review,
                    employeeName: review.isAnonymous ? 'Người dùng ẩn danh' : review.employee.fullName,
                    employee: review.isAnonymous ? null : review.employee
                }
            });
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error: any) {
        console.error('Admin reply error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi gửi phản hồi.',
            message: error.message || 'Unknown error'
        });
    }
});

/**
 * GET /api/reviews/meal/:mealId
 * Get all reviews for a specific meal
 */
router.get('/meal/:mealId', async (req, res) => {
    try {
        const { mealId } = req.params;
        const reviews = await prisma.mealReview.findMany({
            where: { mealEventId: mealId },
            include: {
                employee: {
                    select: {
                        fullName: true,
                        employeeCode: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Sanitize response to hide identities for anonymous reviews
        const sanitizedReviews = reviews.map(r => ({
            ...r,
            employeeName: r.isAnonymous ? 'Người dùng ẩn danh' : r.employee.fullName,
            employee: r.isAnonymous ? null : r.employee
        }));

        res.json({
            success: true,
            data: sanitizedReviews
        });
    } catch (error) {
        console.error('Fetch reviews error:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi lấy đánh giá.' });
    }
});

/**
 * GET /api/reviews/my
 * Get current user's reviews
 */
router.get('/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const employeeId = req.user!.employeeId;
        const reviews = await prisma.mealReview.findMany({
            where: { employeeId },
            include: {
                mealEvent: true,
                employee: {
                    select: {
                        fullName: true,
                        employeeCode: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Fetch my reviews error:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi lấy đánh giá của bạn.' });
    }
});

export default router;
