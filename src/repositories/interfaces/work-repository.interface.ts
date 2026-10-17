import { Types } from "mongoose";
import { IWork } from "../../models/work.model";
import { ITemplateContent, ITemplateImage } from "../../models/template.model";

export type WorkInput = {
  slug: string;
  name: string;
  description?: string;
  userId?: string | Types.ObjectId | null;
  categoryId: string | Types.ObjectId;
  templateId: string | Types.ObjectId;
  selectedThemeId?: string | Types.ObjectId | null;
  isActive?: boolean;
  paymentStatus?: "unpaid" | "paid";
  orderId?: Types.ObjectId | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
  images?: ITemplateImage[];
  content?: Partial<ITemplateContent>;
};

export type WorkUpdate = {
  name?: string;
  paymentStatus?: "unpaid" | "paid";
  orderId?: Types.ObjectId | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
  content?: Partial<ITemplateContent>;
  selectedThemeId?: string | Types.ObjectId;
  images?: ITemplateImage[];
};

export default interface IWorkRepository {
  findAll(): Promise<IWork[]>;
  findByUserId(userId: string): Promise<IWork[]>;
  findBySlug(slug: string): Promise<IWork | null>;
  findById(id: string): Promise<IWork | null>;
  slugExists(slug: string): Promise<boolean>;
  create(data: WorkInput): Promise<IWork>;
  updateBySlug(slug: string, data: WorkUpdate): Promise<IWork | null>;
  updateSelectedTheme(id: string, selectedThemeId: string): Promise<IWork | null>;
}
