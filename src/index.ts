import express from "express";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { userMiddleware } from "./middleware";
import { SECRET } from "./config";
import { random } from "./utilis";

const app = express();
app.use(express.json());

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
  }

  const hashpassword = await bcrypt.hash(password, 8);

  const user = await UserModel.create({
    username: username,
    password: hashpassword,
  });

  const token = jwt.sign(
    {
      username: user.username,
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
app.post("/api/v1/signin", async (req, res) => {
  const username: string = req.body.username;
  const password: string = req.body.password;

  const isUserPresent = await UserModel.findOne({ username });

  if (!isUserPresent) {
    res.status(400).json({
      message: "User Not Present Please Sign up ",
    });
  }

  bcrypt.compare(
    password,
    isUserPresent?.password || " ",
    function (err, result) {
      if (err) {
        res.status(402).json({ message: "The passowrd is inCorrect" });
      }
      const token = jwt.sign(
        {
          username: isUserPresent?.username,
          id: isUserPresent?._id,
        },
        SECRET
      );
      return res.status(200).json({
        token: token,
        message: " User Successfully Sign up",
      });
    }
  );
});

// create Content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const title = req.body.title;
  const link = req.body.link;

  await ContentModel.create({
    title,
    link,
    //@ts-ignore
    userId: req.userId,
    tag: [],
  });

  res.status(200).json({
    message: "The content is created",
  });
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
  }).populate("userId" , "username");

  res.json({
    content,
  });
});

app.listen(3000, () => {
  console.log(`server running at http://localhost:3000`);
});
