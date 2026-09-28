import { ITheme } from "../../models/theme.model";

export function groupThemes(themes: ITheme[]): Map<string, ITheme[]> {
  const grouped = new Map<string, ITheme[]>();

  for (const theme of themes) {
    const key = String(theme.templateId);
    const list = grouped.get(key) || [];
    list.push(theme);
    grouped.set(key, list);
  }

  return grouped;
}
