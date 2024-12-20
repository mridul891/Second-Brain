"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.TagModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
});
const contentTypes = ["image", "video", "article", "audio"]; // Extend as needed
const contentSchema = new mongoose_1.Schema({
    title: String,
    link: String,
    type: { type: String, enum: contentTypes, required: true },
    tags: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Tag",
        },
    ],
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    },
});
const tagSchema = new mongoose_1.Schema({
    tagname: {
        Type: String,
    },
});
const LinkSchema = new mongoose_1.Schema({
    hash: {
        type: String,
    },
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
exports.ContentModel = (0, mongoose_1.model)("Content", contentSchema);
exports.TagModel = (0, mongoose_1.model)("Tag", tagSchema);
exports.LinkModel = (0, mongoose_1.model)("Link", LinkSchema);
