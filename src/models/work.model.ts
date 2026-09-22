import { Schema, model, Document, Types } from "mongoose";
import {
  ITemplateContent,
  ITemplateImage,
  templateContentSchema,
  templateImageSchema,
} from "./template.model";
import "./category.model";
import "./theme.model";

export interface IWork extends Document {
  slug: string;
  name: string;
  description: string;
  categoryId: Types.ObjectId;
  templateId: Types.ObjectId;
  selectedThemeId?: Types.ObjectId;
  isActive: boolean;
  images: ITemplateImage[];
  content: ITemplateContent;
  createdAt: Date;
  updatedAt: Date;
}

const workSchema = new Schema<IWork>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      immutable: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
      immutable: true,
    },
    selectedThemeId: {
      type: Schema.Types.ObjectId,
      ref: "Theme",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [templateImageSchema],
      default: [],
    },
    content: {
      type: templateContentSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export const WorkModel = model<IWork>("Work", workSchema, "works");
