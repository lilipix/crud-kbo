import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.addresses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  typeOfAddress!: string | null;

  @Column("text", { nullable: true })
  countryFR!: string | null;

  @Column("text", { nullable: true })
  zipcode!: string | null;

  @Column("text", { nullable: true })
  streetFR!: string | null;

  @Column("text", { nullable: true })
  houseNumber!: string | null;

  @Column("text", { nullable: true })
  box!: string | null;

  @Column("text", { nullable: true })
  dateStrikingOff!: string | null;
}
