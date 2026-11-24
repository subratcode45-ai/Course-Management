import { Router } from 'express';
import { protect } from '../Middlewares/auth.js';
import { enrollCourse, getMyCourses } from '../Controllers/enroll.controller.js';

const router = Router();

router.get('/my-courses', protect, getMyCourses);
router.post('/:courseId', protect, enrollCourse);

export default router;