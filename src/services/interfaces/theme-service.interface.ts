import { toThemeJson } from "../../mappers/theme.mapper";

export type ThemeJson = ReturnType<typeof toThemeJson>;

export default interface IThemeService {
  list(templateId: string): Promise<ThemeJson[]>;
}
