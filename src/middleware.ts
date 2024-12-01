import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "./config";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const decode = jwt.verify(header as string, SECRET);

  if (decode) {
    //@ts-ignore
    req.userId = decode.id;
    next();
  } else {
    res.status(400).json({
      message: "You are not loggged in ",
    });
  }
};
