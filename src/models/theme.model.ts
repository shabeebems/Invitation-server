import { Schema, model, Document, Types } from "mongoose";

export interface ITheme extends Document {
  title: string;
  templateId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const themeSchema = new Schema<ITheme>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
  },
  { timestamps: true }
);

themeSchema.index({ templateId: 1, createdAt: 1 });

export const ThemeModel = model<ITheme>("Theme", themeSchema, "themes");
