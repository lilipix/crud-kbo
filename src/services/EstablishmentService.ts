import { dataSource } from "../datasource";
import { Establishment } from "../entities/Establishment";
import { Enterprise } from "../entities/Enterprise";

export class EstablishmentService {
  private repo = dataSource.getRepository(Establishment);
  private enterpriseRepo = dataSource.getRepository(Enterprise);

  async createEstablishment(
    enterpriseNumber: string,
    data: Partial<Establishment>
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
    data: Partial<Establishment>
  ) {
    await this.repo.update(establishmentNumber, data);
    return this.repo.findOne({ where: { establishmentNumber } });
  }
}
