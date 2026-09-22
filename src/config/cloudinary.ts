import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CATEGORY_IMAGE_FOLDER = "invitation/categories";
export const TEMPLATE_IMAGE_FOLDER = "invitation/templates";
export const WORK_IMAGE_FOLDER = "invitation/works";

export type UploadedImage = {
  url: string;
  publicId: string;
};

function fromResult(result: { secure_url: string; public_id: string }): UploadedImage {
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadImageBuffer(
  file: Express.Multer.File,
  folder: string
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Image upload failed"));
          return;
        }

        resolve(fromResult(result));
      }
    );

    stream.end(file.buffer);
  });
}

export async function uploadImageFile(filePath: string, folder: string): Promise<UploadedImage> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });

  return fromResult(result);
}

export async function uploadCategoryImage(file: Express.Multer.File): Promise<UploadedImage> {
  return uploadImageBuffer(file, CATEGORY_IMAGE_FOLDER);
}

export async function uploadTemplateImage(file: Express.Multer.File): Promise<UploadedImage> {
  return uploadImageBuffer(file, TEMPLATE_IMAGE_FOLDER);
}

export async function uploadWorkImage(file: Express.Multer.File): Promise<UploadedImage> {
  return uploadImageBuffer(file, WORK_IMAGE_FOLDER);
}

export async function uploadImageFromUrl(url: string, folder: string): Promise<UploadedImage> {
  const result = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: "image",
  });

  return fromResult(result);
}

export function isWorkCloudinaryId(publicId?: string) {
  return Boolean(publicId && publicId.startsWith(`${WORK_IMAGE_FOLDER}/`));
}

export async function deleteCloudinaryImage(publicId?: string): Promise<void> {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
}
