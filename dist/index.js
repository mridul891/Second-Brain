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
const utilis_1 = require("./utilis");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
        return;
    }
    const hashpassword = yield bcryptjs_1.default.hash(password, 8);
    const user = yield db_1.UserModel.create({
        username,
        password: hashpassword,
    });
    const token = jsonwebtoken_1.default.sign({
        userId: username,
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
        return;
    }
    console.log(isUserPresent.password);
    bcryptjs_1.default.compare(password, isUserPresent === null || isUserPresent === void 0 ? void 0 : isUserPresent.password, (err, isMatch) => {
        if (err) {
            return res.status(402).json({ message: "Error occured while Checking" });
        }
        if (isMatch) {
            const token = jsonwebtoken_1.default.sign({
                username: isUserPresent.username,
                id: isUserPresent._id,
            }, config_1.SECRET);
            res.status(200).json({
                token,
                message: "User Successfully Sign up",
            });
            return;
        }
        else {
            return res.json(400).json({
                message: "Password is Wrong",
            });
        }
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
    res.status(200).json({
        message: "The content is created",
    });
}));
// Get Content
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId,
    }).populate("userId", "username");
    res.status(200).json({
        content,
    });
}));
// Delete Content
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        // @ts-ignore
        userId: req.userId,
    });
    res.json({
        message: "Deleted The content",
    });
}));
// Share Brain
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const exisitingHash = yield db_1.LinkModel.findOne({
            userId: req.userId,
        });
        if (exisitingHash) {
            res.json({
                message: "/share/" + exisitingHash.hash,
            });
            return;
        }
        const hash = (0, utilis_1.random)(10);
        yield db_1.LinkModel.create({
            userId: req.userId,
            hash: hash,
        });
        res.json({
            message: "/share/" + hash,
        });
    }
    else {
        yield db_1.LinkModel.deleteOne({
            userId: req.userId,
        });
        res.json({
            message: "removed LInk",
        });
    }
}));
// Brain Link
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinkModel.findOne({
        hash,
    });
    if (!link) {
        res.status(400).json({
            message: " The hash is incorrect",
        });
        return;
    }
    const content = yield db_1.ContentModel.find({
        userId: link.userId,
    }).populate("userId", "username");
    res.json({
        content,
    });
}));
app.listen(3000, () => {
    console.log(`server running at http://localhost:3000`);
});
