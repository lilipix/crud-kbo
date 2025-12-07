import { Check, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Establishment } from "./Establishment";
import { Address } from "./Address";
import { Activity } from "./Activity";
import { Denomination } from "./Denomination";
import { Contact } from "./Contact";

@Entity()
@Check(`"enterpriseNumber" ~ '^[0-9]{4}\.[0-9]{3}\.[0-9]{3}$'`)
@Check(`"status" IN ('AC', 'ST') OR "status" IS NULL`)
export class Enterprise {
  @PrimaryColumn({ length: 15 })
  enterpriseNumber!: string;

  @Column({ type: "varchar", length: 3, nullable: true })
  status!: string | null;

  @Column({ type: "varchar", length: 3, nullable: true })
  juridicalSituation!: string | null;

  @Column({ type: "varchar", length: 1, nullable: true })
  typeOfEnterprise!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  juridicalForm!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
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
