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
export class Denomination {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 15 })
  @Index()
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.denominations, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column({ type: "varchar", length: 2, nullable: true })
  language!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  typeOfDenomination!: string | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  @Index()
  denomination!: string | null;
}
