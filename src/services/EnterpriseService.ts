import { Code } from "../entities/Code";
import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";
import {
  CreateEnterpriseInput,
  UpdateEnterpriseInput,
} from "../validators/enterprise.validator";
import { Activity } from "../entities/Activity";
import { Establishment } from "../entities/Establishment";

export class EnterpriseService {
  private repo = dataSource.getRepository(Enterprise);
  private codeRepo = dataSource.getRepository(Code);
  private activityRepo = dataSource.getRepository(Activity);
  private establishmentRepo = dataSource.getRepository(Establishment);

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
    return await dataSource.transaction(async (manager) => {
      const activityCode = await this.codeRepo.findOne({
        where: { code: data.activityCode },
      });

      if (!activityCode) {
        throw new Error("Invalid activityCode: must exist in the CSV list.");
      }
      const enterprise = manager.create(Enterprise, {
        enterpriseNumber: data.enterpriseNumber,
        status: data.status ?? null,
        juridicalSituation: data.juridicalSituation ?? null,
        typeOfEnterprise: data.typeOfEnterprise ?? null,
        juridicalForm: data.juridicalForm ?? null,
        juridicalFormCAC: data.juridicalFormCAC ?? null,
        startDate: data.startDate ? new Date(data.startDate) : null,
      });

      await manager.save(enterprise);

      const activity = manager.create(Activity, {
        entityNumber: data.enterpriseNumber,
        naceCode: data.activityCode,
        enterprise: enterprise,
      });

      await manager.save(activity);

      if (data.establishments && data.establishments.length > 0) {
        for (const e of data.establishments) {
          const establishment = manager.create(Establishment, {
            establishmentNumber: e.establishmentNumber,
            startDate: e.startDate ?? null,
            enterpriseNumber: data.enterpriseNumber,
            enterprise: enterprise,
          });

          await manager.save(establishment);
        }
      }
      return manager.findOne(Enterprise, {
        where: { enterpriseNumber: data.enterpriseNumber },
        relations: ["activities", "establishments"],
      });
    });
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
