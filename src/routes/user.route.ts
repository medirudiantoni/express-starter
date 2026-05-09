import express from 'express';
import * as userController from '../controllers/user.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/users/all', requireAuth, userController.getUsers);
router.get('/users/:id', requireAuth, userController.getUserById);

export default router;