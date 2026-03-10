import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router: Router = Router();
const prisma = new PrismaClient();

// Get all directories (with search)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        const where: any = {};
        if (search) {
            where.fullName = { contains: String(search), mode: 'insensitive' };
        }

        const directories = await prisma.guestDirectory.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: directories
        });
    } catch (error) {
        console.error('Failed to get guest directories:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve guest directories' });
    }
});

// Create new directory
router.post('/', async (req, res) => {
    try {
        const { fullName, note, isActive } = req.body;
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        const newDirectory = await prisma.guestDirectory.create({
            data: {
                fullName,
                note,
                isActive: isActive ?? true
            }
        });

        res.status(201).json({ success: true, data: newDirectory });
    } catch (error) {
        console.error('Failed to create guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to create guest directory' });
    }
});

// Update directory
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, note, isActive } = req.body;

        const updated = await prisma.guestDirectory.update({
            where: { id },
            data: {
                fullName,
                note,
                isActive
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Failed to update guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to update guest directory' });
    }
});

// Delete directory
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.guestDirectory.delete({ where: { id } });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Failed to delete guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to delete guest directory' });
    }
});

export default router;
