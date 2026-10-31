import { ISiteAsset, SiteAssetKey } from "../../models/site-asset.model";

export type SiteAssetInput = {
  url: string;
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
};

export default interface ISiteAssetRepository {
  findAll(): Promise<ISiteAsset[]>;
  findByKey(key: SiteAssetKey): Promise<ISiteAsset | null>;
  upsert(key: SiteAssetKey, data: SiteAssetInput): Promise<ISiteAsset>;
}
