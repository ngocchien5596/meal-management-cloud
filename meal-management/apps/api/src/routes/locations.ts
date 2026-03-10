import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { Role } from '@prisma/client';

const router: Router = Router();

// GET /api/locations
// Fetch all locations, sorted by name, with default on top
router.get('/', authenticate, async (req, res, next) => {
    try {
        const locations = await prisma.mealLocation.findMany({
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        });

        res.json({ success: true, data: locations });
    } catch (error) {
        next(error);
    }
});

// POST /api/locations
// Create a new location (Admin only)
router.post('/', authenticate, async (req: any, res: any, next: any) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== Role.ADMIN_SYSTEM && userRole !== Role.ADMIN_KITCHEN) {
             return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const location = await prisma.mealLocation.create({
            data: { name: name.trim() }
        });

        res.status(201).json({ success: true, data: location });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'A location with this name already exists' });
        }
        next(error);
    }
});

// PUT /api/locations/:id
// Update a location (Admin only)
router.put('/:id', authenticate, async (req: any, res: any, next: any) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== Role.ADMIN_SYSTEM && userRole !== Role.ADMIN_KITCHEN) {
             return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const { id } = req.params;
        const { name, isDefault } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        // If setting this to default, unset others first
        if (isDefault) {
             await prisma.mealLocation.updateMany({
                 where: { isDefault: true, id: { not: id } },
                 data: { isDefault: false }
             });
        }

        const location = await prisma.mealLocation.update({
            where: { id },
            data: { 
                name: name.trim(),
                ...(isDefault !== undefined && { isDefault })
            }
        });

        res.json({ success: true, data: location });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Location not found' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'A location with this name already exists' });
        }
        next(error);
    }
});

// DELETE /api/locations/:id
// Delete a location (Admin only)
router.delete('/:id', authenticate, async (req: any, res: any, next: any) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== Role.ADMIN_SYSTEM && userRole !== Role.ADMIN_KITCHEN) {
             return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const { id } = req.params;

        // Check if there are any registrations using this location
        const inUseCount = await prisma.registration.count({
            where: { locationId: id }
        });

        if (inUseCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete location because it is being used in meal registrations' 
            });
        }
        
        // Also check presets
        const inUsePresetCount = await prisma.registrationPreset.count({
            where: { locationId: id }
        });

        if (inUsePresetCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete location because it is being used in registration presets' 
            });
        }

        // Prevent deleting the default location
        const location = await prisma.mealLocation.findUnique({ where: { id } });
        if (location?.isDefault) {
             return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete the default location. Please set another location as default first.' 
            });
        }

        await prisma.mealLocation.delete({
            where: { id }
        });

        res.json({ success: true, data: null });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Location not found' });
        }
        next(error);
    }
});

export default router;
