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
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 15 })
  @Index()
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.activities, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  activityGroup!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  naceVersion!: string | null;

  @Column({ type: "varchar", length: 8 })
  naceCode!: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  classification!: string | null;
}
