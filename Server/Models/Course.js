import mongoose from "mongoose";

const curriculumSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lessons: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    curriculum: {
      type: [curriculumSectionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const courseModel = mongoose.model("Course", courseSchema);
export default courseModel;
