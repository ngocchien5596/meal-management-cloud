import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

/**
 * POST /api/reviews
 * Submit a new meal evaluation
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { date, mealType, comment, images, isAnonymous } = req.body;
        const employeeId = req.user!.employeeId;

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

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Review creation error:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi gửi đánh giá.' });
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

export default router;
