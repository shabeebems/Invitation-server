import { ITheme } from "../models/theme.model";

export function toThemeJson(theme: ITheme) {
  return {
    id: String(theme._id),
    title: theme.title,
    templateId: String(theme.templateId),
    createdAt: theme.createdAt,
    updatedAt: theme.updatedAt,
  };
}
