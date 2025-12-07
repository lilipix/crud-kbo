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
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 15 })
  @Index()
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.contacts, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column({ type: "varchar", length: 15, nullable: true })
  entityContact!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  contactType!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  value!: string | null;
}
