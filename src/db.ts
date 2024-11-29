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

const contentTypes = ["image", "video", "article", "audio"]; // Extend as needed

const contentSchema = new Schema({
  title: String,
  link: String,
  type: { type: String, enum: contentTypes, required: true },
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

const tagSchema = new Schema({
  tagname: {
    Type: String,
  },
});

const LinkSchema = new Schema({
  hash: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const UserModel = model("User", userSchema);
export const ContentModel = model("Content", contentSchema);
export const TagModel = model("Tag", tagSchema);
export const LinkModel = model("Link", LinkSchema);
