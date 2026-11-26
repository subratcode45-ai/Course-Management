import Enrollment from "../Models/Enrollment.js";
import Course from "../Models/Course.js";

export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.price > 0) {
      const paid = await Payment.exists({
        user: req.user._id,
        course: course._id,
        status: "paid",
      });
      if (!paid) {
        return res
          .status(402)
          .json({ message: "Payment required for this course" });
      }
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
    });
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json({ message: "You already purchased this course" });
    res.status(500).json({ message: err.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate(
      "course",
    );
    res.json(enrollments.map((e) => e.course).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
