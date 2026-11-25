import { Router } from 'express';
import { protect, adminOnly } from '../Middlewares/auth.js';
import {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
} from '../Controllers/course.controller.js';
import upload from '../Middlewares/upload.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

export default router;