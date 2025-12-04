import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Establishment } from "./Establishment";
import { Address } from "./Address";
import { Activity } from "./Activity";
import { Denomination } from "./Denomination";
import { Contact } from "./Contact";

/**
 * @openapi
 * components:
 *   schemas:
 *     Enterprise:
 *       type: object
 *       properties:
 *         enterpriseNumber:
 *           type: string
 *           example: "0123456789"
 *         status:
 *           type: string
 *           nullable: true
 *         juridicalSituation:
 *           type: string
 *           nullable: true
 *         typeOfEnterprise:
 *           type: string
 *           nullable: true
 *         juridicalForm:
 *           type: string
 *           nullable: true
 *         juridicalFormCAC:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date
 *           nullable: true
 */

@Entity()
export class Enterprise {
  @PrimaryColumn({ length: 10 })
  enterpriseNumber!: string;

  @Column({ type: "varchar", nullable: true })
  status!: string | null;

  @Column({ type: "varchar", nullable: true })
  juridicalSituation!: string | null;

  @Column({ type: "varchar", nullable: true })
  typeOfEnterprise!: string | null;

  @Column({ type: "varchar", nullable: true })
  juridicalForm!: string | null;

  @Column({ type: "varchar", nullable: true })
  juridicalFormCAC!: string | null;

  @Column({ type: "date", nullable: true })
  startDate!: Date | null;

  @OneToMany(() => Establishment, (e) => e.enterprise, {
    cascade: true,
    onDelete: "CASCADE",
  })
  establishments!: Establishment[];

  @OneToMany(() => Address, (a) => a.enterprise)
  addresses!: Address[];

  @OneToMany(() => Activity, (a) => a.enterprise)
  activities!: Activity[];

  @OneToMany(() => Denomination, (d) => d.enterprise)
  denominations!: Denomination[];

  @OneToMany(() => Contact, (c) => c.enterprise)
  contacts!: Contact[];
}
