import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

// GET /api/v1/system/time - Get current server time
router.get('/time', async (req, res) => {
    res.json({
        success: true,
        data: {
            serverTime: new Date().toISOString(),
            timezone: 'Asia/Ho_Chi_Minh'
        }
    });
});

export default router;
