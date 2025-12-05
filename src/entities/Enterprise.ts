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
 *       required:
 *         - enterpriseNumber
 *       properties:
 *         enterpriseNumber:
 *           type: string
 *           example: "0201.183.146"
 *         status:
 *           type: string
 *           nullable: true
 *           example: "AC"
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
 *         addresses:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Address"
 *         activities:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Activity"
 *         denominations:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Denomination"
 *         contacts:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Contact"
 *         establishments:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Establishment"
 */

@Entity()
export class Enterprise {
  @PrimaryColumn({ length: 15 })
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
