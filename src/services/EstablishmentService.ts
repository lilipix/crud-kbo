import { dataSource } from "../datasource";
import { Establishment } from "../entities/Establishment";
import { Enterprise } from "../entities/Enterprise";
import {
  CreateEstablishmentInput,
  UpdateEstablishmentInput,
} from "../validators/establishment.validator";

export class EstablishmentService {
  private repo = dataSource.getRepository(Establishment);
  private enterpriseRepo = dataSource.getRepository(Enterprise);

  async createEstablishment(
    enterpriseNumber: string,
    data: CreateEstablishmentInput
  ) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { enterpriseNumber },
    });

    if (!enterprise) {
      throw new Error("Enterprise not found");
    }

    const establishment = this.repo.create({
      ...data,
      enterprise,
    });

    return this.repo.save(establishment);
  }

  async updateEstablishment(
    establishmentNumber: string,
    data: UpdateEstablishmentInput
  ) {
    await this.repo.update(establishmentNumber, data);
    return this.repo.findOne({ where: { establishmentNumber } });
  }

  async delete(establishmentNumber: string) {
    return this.repo.delete({ establishmentNumber });
  }
}
