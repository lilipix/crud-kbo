import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";
import {
  CreateEnterpriseInput,
  UpdateEnterpriseInput,
} from "../validators/enterprise.schema";

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

  async create(data: CreateEnterpriseInput) {
    const enterprise = this.repo.create(data);

    return this.repo.save(enterprise);
  }

  async updateByEnterpriseNumber(
    enterpriseNumber: string,
    data: UpdateEnterpriseInput
  ) {
    const result = await this.repo.update({ enterpriseNumber }, data);
    if (result.affected === 0) return null;
    return this.findOne(enterpriseNumber);
  }

  async delete(enterpriseNumber: string) {
    return this.repo.delete({ enterpriseNumber });
  }
}
