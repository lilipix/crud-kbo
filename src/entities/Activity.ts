import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.activities, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  activityGroup!: string | null;

  @Column("text", { nullable: true })
  naceVersion!: string | null;

  @Column("text", { nullable: true })
  naceCode!: string | null;

  @Column("text", { nullable: true })
  classification!: string | null;
}
