import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
@Check(`"establishmentNumber" ~ '^2\.[0-9]{3}\.[0-9]{3}\.[0-9]{3}$'`)
export class Establishment {
  @PrimaryColumn({ type: "varchar", length: 15 })
  establishmentNumber!: string;

  @Column({ type: "varchar", length: 15 })
  @Index()
  enterpriseNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.establishments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "enterpriseNumber" })
  enterprise?: Enterprise | null;

  @Column({ type: "date", nullable: true })
  startDate!: Date | null;
}
