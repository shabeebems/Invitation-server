import { Schema, model, Document } from "mongoose";

export const SITE_ASSET_KEYS = ["landingHero"] as const;

export type SiteAssetKey = (typeof SITE_ASSET_KEYS)[number];

export function isSiteAssetKey(value: string): value is SiteAssetKey {
  return (SITE_ASSET_KEYS as readonly string[]).includes(value);
}

export interface ISiteAsset extends Document {
  key: SiteAssetKey;
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

const siteAssetSchema = new Schema<ISiteAsset>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: SITE_ASSET_KEYS,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const SiteAssetModel = model<ISiteAsset>("SiteAsset", siteAssetSchema, "site_asset");
