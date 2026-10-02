import { Request } from "express";
import { toWorkJson } from "../../mappers/work.mapper";

export type WorkActor = {
  userId: string;
  role: "customer" | "admin";
};

export type WorkJson = ReturnType<typeof toWorkJson>;

export default interface IWorkService {
  list(actor: WorkActor): Promise<WorkJson[]>;
  show(slug: string): Promise<WorkJson>;
  create(body: unknown, userId: string): Promise<WorkJson>;
  update(slug: string, body: unknown, actor: WorkActor, file?: Request["file"]): Promise<WorkJson | undefined>;
  selectTheme(slug: string, body: unknown, actor: WorkActor): Promise<WorkJson | undefined>;
}
