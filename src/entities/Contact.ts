import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Enterprise } from "./Enterprise";

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.contacts, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  entityContact!: string | null;

  @Column("text", { nullable: true })
  contactType!: string | null;

  @Column("text", { nullable: true })
  value!: string | null;
}
