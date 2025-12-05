import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Establishment } from "./Establishment";
import { Address } from "./Address";
import { Activity } from "./Activity";
import { Denomination } from "./Denomination";
import { Contact } from "./Contact";

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
