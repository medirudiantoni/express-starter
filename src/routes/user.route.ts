import express from 'express';
import * as userController from '../controllers/user.controller.js';
import requireAuth, { requirePermission } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/users/all', requireAuth, requirePermission('User', 'read'), userController.getUsers);
router.get('/users/:id', requireAuth, requirePermission('User', 'read'), userController.getUserById);

export default router;