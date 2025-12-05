import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Enterprise } from "./Enterprise";

/**
 * @openapi
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         entityNumber:
 *           type: string
 *         entityContact:
 *           type: string
 *           nullable: true
 *         contactType:
 *           type: string
 *           nullable: true
 *         value:
 *           type: string
 *           nullable: true
 */

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
