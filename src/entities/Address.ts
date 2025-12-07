import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 15 })
  @Index()
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.addresses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  typeOfAddress!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  countryFR!: string | null;

  @Column({ type: "varchar", length: 4, nullable: true })
  zipcode!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  streetFR!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  houseNumber!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  box!: string | null;

  @Column({ type: "date", nullable: true })
  dateStrikingOff!: Date | null;
}
