import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required."],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    trim: true,
  },
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
