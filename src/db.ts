import mongoose, { model, mongo, Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
});

const contentSchema = new Schema({
  title: String,
  link: String,
  tags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Tag",
    },
  ],
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const UserModel = model("User", userSchema);
export const ContentModel = model("Content", contentSchema);
 