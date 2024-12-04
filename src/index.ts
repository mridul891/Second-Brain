import express from "express";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { userMiddleware } from "./middleware";
import { SECRET } from "./config";
import { random } from "./utilis";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect(
  "mongodb+srv://pandeymridulwork:mridul891@secondbrain.oryn8.mongodb.net/"
);

app.get("/api/v1/", (req, res) => {
  res.json({
    message: "The fucking server is started",
  });
});

// signup
app.post("/api/v1/signup", async (req, res) => {
  // zod Validation
  const username = req.body.username;
  const password = req.body.password;

  const exisitingUser = await UserModel.findOne({
    username,
  });

  if (exisitingUser) {
    res.status(401).json({
      message: "User Already Exists",
    });
    return;
  }

  const hashpassword = await bcrypt.hash(password, 8);

  const user = await UserModel.create({
    username,
    password: hashpassword,
  });

  const token = jwt.sign(
    {
      userId: username,
      _id: user._id,
    },
    SECRET
  );

  res.json({
    message: "User Signed Up",
    token: token,
  });
});

// signin
app.post("/api/v1/signin", async (req, res):Promise<any> => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and Password are required",
      });
    }

    // Find the user by username
    const isUserPresent = await UserModel.findOne({ username });

    if (!isUserPresent) {
      return res.status(400).json({
        message: "User not present. Please sign up.",
      });
    }

    // Compare passwords
    const isMatch =  await bcrypt.compare(password, isUserPresent?.password as string  );

    if (isMatch) {
      const token = jwt.sign({
        userId : username,
        _id : isUserPresent._id
      } ,SECRET)
      return res.status(200).json({
        token:token,
        message: "User successfully signed in",
      });
    } else {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// Get Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId,
  }).populate("userId", "username");

  res.status(200).json({
    content,
  });
});

// Delete Content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  await ContentModel.deleteMany({
    contentId,
    // @ts-ignore
    userId: req.userId,
  });

  res.json({
    message: "Deleted The content",
  });
});

// Share Brain
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body;
  if (share) {
    const exisitingHash = await LinkModel.findOne({
      userId: req.userId,
    });

    if (exisitingHash) {
      res.json({
        message: "/share/" + exisitingHash.hash,
      });
      return;
    }

    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      message: "/share/" + hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "removed LInk",
    });
  }
});

// Brain Link
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;
  const link = await LinkModel.findOne({
    hash,
  });
  if (!link) {
    res.status(400).json({
      message: " The hash is incorrect",
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  }).populate("userId", "username");

  res.json({
    content,
  });
});

app.listen(3000, () => {
  console.log(`server running at http://localhost:3000`);
});
