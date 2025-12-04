import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";
import { EnterpriseRepository } from "../repositories/EnterpriseRepository";

export class EnterpriseService {
  private repo = dataSource.getRepository(Enterprise);

  async findOne(enterpriseNumber: string) {
    return this.repo.findOne({
      where: { enterpriseNumber },
      relations: [
        "addresses",
        "activities",
        "denominations",
        "contacts",
        "establishments",
      ],
    });
  }

  async findOneByName(denomination: string) {
    return this.repo
      .createQueryBuilder("enterprise")
      .leftJoinAndSelect("enterprise.denominations", "denomination")
      .leftJoinAndSelect("enterprise.addresses", "addresses")
      .leftJoinAndSelect("enterprise.activities", "activities")
      .leftJoinAndSelect("enterprise.contacts", "contacts")
      .leftJoinAndSelect("enterprise.establishments", "establishments")
      .where("denomination.denomination ILIKE :denomination", {
        denomination: `%${denomination}%`,
      })
      .getOne();
  }

  async create(data: Enterprise) {
    const enterprise = this.repo.create(data);

    return this.repo.save(enterprise);
  }

  async updateByEnterpriseNumber(
    enterpriseNumber: string,
    data: Partial<Enterprise>
  ) {
    await this.repo.update({ enterpriseNumber }, data);
    return this.findOne(enterpriseNumber);
  }

  async delete(enterpriseNumber: string) {
    return this.repo.delete({ enterpriseNumber });
  }
}
