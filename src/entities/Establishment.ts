import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Establishment {
  @PrimaryColumn("text")
  establishmentNumber!: string;

  @Column("text")
  enterpriseNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.establishments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "enterpriseNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  startDate!: string | null;
}
