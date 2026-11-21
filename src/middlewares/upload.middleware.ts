import multer from "multer";
import { NextFunction, Request, Response } from "express";
import {
  isAllowedImageBuffer,
  isAllowedImageMime,
  isBlockedImageName,
} from "../common/http/image-bytes";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isBlockedImageName(file.originalname) || !isAllowedImageMime(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
      return;
    }

    cb(null, true);
  },
}).single("image");

export function uploadImageMiddleware(req: Request, res: Response, next: NextFunction): void {
  imageUpload(req, res, (error) => {
    if (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Could not upload image",
      });
      return;
    }

    if (req.file && !isAllowedImageBuffer(req.file.buffer)) {
      res.status(400).json({
        success: false,
        message: "Only JPEG, PNG, GIF, or WebP images are allowed",
      });
      return;
    }

    next();
  });
}
