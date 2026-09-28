import { Request } from "express";
import { toWorkJson } from "../../mappers/work.mapper";

export type WorkJson = ReturnType<typeof toWorkJson>;

export default interface IWorkService {
  list(): Promise<WorkJson[]>;
  show(slug: string): Promise<WorkJson>;
  create(body: unknown): Promise<WorkJson>;
  update(slug: string, body: unknown, file?: Request["file"]): Promise<WorkJson | undefined>;
  selectTheme(slug: string, body: unknown): Promise<WorkJson | undefined>;
}
