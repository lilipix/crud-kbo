import { Code } from "../entities/Code";
import { dataSource } from "../datasource";
import { Enterprise } from "../entities/Enterprise";
import {
  CreateEnterprise,
  UpdateEnterprise,
} from "../validators/enterprise.validator";
import { Activity } from "../entities/Activity";
import { Establishment } from "../entities/Establishment";

export class EnterpriseService {
  private repo = dataSource.getRepository(Enterprise);
  private codeRepo = dataSource.getRepository(Code);

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

  async create(data: CreateEnterprise) {
    return await dataSource.transaction(async (manager) => {
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

      if (data.activities && data.activities.length > 0) {
        for (const activityInput of data.activities) {
          // check nace code in table nace
          const nace = await this.codeRepo.findOne({
            where: { code: activityInput.naceCode },
          });

          if (!nace) {
            throw new Error(`Invalid naceCode: ${activityInput.naceCode}`);
          }

          const activity = manager.create(Activity, {
            entityNumber: enterprise.enterpriseNumber,
            naceCode: activityInput.naceCode,
            naceVersion: nace?.category?.replace("Nace", ""),
            classification: activityInput.classification ?? "",
          });

          await manager.save(activity);
        }
      }

      if (data.establishments && data.establishments.length > 0) {
        for (const est of data.establishments) {
          const establishment = manager.create(Establishment, {
            establishmentNumber: est.establishmentNumber,
            startDate: est.startDate ?? null,
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
    data: UpdateEnterprise
  ) {
    return await dataSource.transaction(async (manager) => {
      const enterprise = await manager.findOne(Enterprise, {
        where: { enterpriseNumber },
        relations: ["establishments"],
      });

      if (!enterprise) return null;

      Object.assign(enterprise, {
        status: data.status ?? enterprise.status,
        juridicalSituation:
          data.juridicalSituation ?? enterprise.juridicalSituation,
        typeOfEnterprise: data.typeOfEnterprise ?? enterprise.typeOfEnterprise,
        juridicalForm: data.juridicalForm ?? enterprise.juridicalForm,
        juridicalFormCAC: data.juridicalFormCAC ?? enterprise.juridicalFormCAC,
        startDate: data.startDate
          ? new Date(data.startDate)
          : enterprise.startDate,
      });

      await manager.save(enterprise);

      if (data.establishments) {
        for (const establishment of data.establishments) {
          const existing = await manager.findOne(Establishment, {
            where: { establishmentNumber: establishment.establishmentNumber },
          });

          if (existing) {
            existing.startDate = establishment.startDate
              ? new Date(establishment.startDate)
              : existing.startDate;
            await manager.save(existing);
          } else {
            const newEstablishment = manager.create(Establishment, {
              establishmentNumber: establishment.establishmentNumber,
              startDate: establishment.startDate
                ? new Date(establishment.startDate)
                : null,
              enterpriseNumber,
            });
            await manager.save(newEstablishment);
          }
        }
      }
      return this.findOne(enterpriseNumber);
    });
  }

  async delete(enterpriseNumber: string) {
    return this.repo.delete({ enterpriseNumber });
  }
}
