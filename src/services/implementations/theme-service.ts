import { inject, injectable } from "inversify";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import { toThemeJson } from "../../mappers/theme.mapper";
import type IThemeRepository from "../../repositories/interfaces/theme-repository.interface";
import IThemeService from "../interfaces/theme-service.interface";

@injectable()
export default class ThemeService implements IThemeService {
  constructor(@inject(TYPES.IThemeRepository) private readonly themeRepository: IThemeRepository) {}

  async list(templateId: string) {
    return guard("Could not load themes", async () => {
      const themes = templateId
        ? await this.themeRepository.findByTemplateId(templateId)
        : await this.themeRepository.findAll();

      return themes.map(toThemeJson);
    });
  }
}
