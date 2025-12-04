import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.activities, { onDelete: "CASCADE" })
  enterprise!: Enterprise;

  @Column({ type: "varchar", nullable: true })
  activityGroup!: string | null;

  @Column({ type: "varchar", nullable: true })
  naceVersion!: string | null;

  @Column({ type: "varchar", nullable: true })
  naceCode!: string | null;

  @Column({ type: "varchar", nullable: true })
  classification!: string | null;
}
