import multer from "multer";
import { NextFunction, Request, Response } from "express";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
}).single("image");

export function uploadImageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  imageUpload(req, res, (error) => {
    if (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Could not upload image",
      });
      return;
    }

    next();
  });
}

export const uploadCategoryImageMiddleware = uploadImageMiddleware;
