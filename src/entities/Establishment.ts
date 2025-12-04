import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Establishment {
  @PrimaryColumn("text")
  establishmentNumber!: string;

  @Column("text", { nullable: true })
  startDate!: string | null;

  @Column("text")
  enterpriseNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.establishments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  enterprise?: Enterprise | null;
}
