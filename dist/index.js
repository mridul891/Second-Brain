"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default.connect("mongodb+srv://pandeymridulwork:mridul891@secondbrain.oryn8.mongodb.net/");
app.get("/api/v1/", (req, res) => {
    res.json({
        message: "The fucking server is started",
    });
});
// signup
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // zod Validation
    const username = req.body.username;
    const password = req.body.password;
    const exisitingUser = yield db_1.UserModel.findOne({
        username,
    });
    if (exisitingUser) {
        res.status(401).json({
            message: "User Already Exists",
        });
    }
    const hashpassword = yield bcryptjs_1.default.hash(password, 8);
    const user = yield db_1.UserModel.create({
        username: username,
        password: hashpassword,
    });
    const token = jsonwebtoken_1.default.sign({
        username: user.username,
        _id: user._id,
    }, config_1.SECRET);
    res.json({
        message: "User Signed Up",
        token: token,
    });
}));
// signin
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const isUserPresent = yield db_1.UserModel.findOne({ username });
    if (!isUserPresent) {
        res.status(400).json({
            message: "User Not Present Please Sign up ",
        });
    }
    bcryptjs_1.default.compare(password, (isUserPresent === null || isUserPresent === void 0 ? void 0 : isUserPresent.password) || " ", function (err, result) {
        if (err) {
            res.status(402).json({ message: "The passowrd is inCorrect" });
        }
        const token = jsonwebtoken_1.default.sign({
            username: isUserPresent === null || isUserPresent === void 0 ? void 0 : isUserPresent.username,
            id: isUserPresent === null || isUserPresent === void 0 ? void 0 : isUserPresent._id,
        }, config_1.SECRET);
        return res.status(200).json({
            token: token,
            message: " User Successfully Sign up",
        });
    });
}));
// create Content
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const link = req.body.link;
    yield db_1.ContentModel.create({
        title,
        link,
        //@ts-ignore
        userId: req.userId,
        tag: [],
    });
    res.json({
        message: "The content is created",
    });
}));
// Get Content
app.get("/api/v1/content", (req, res) => { });
// Delete Content
app.delete("/api/v1/content", (req, res) => { });
// Share Brain
app.post("/api/v1/brain/share", (req, res) => { });
// Brain Link
app.get("/api/v1/brain/:shareLink", (req, res) => { });
app.listen(3000, () => {
    console.log(`server running at http://localhost:3000`);
});
