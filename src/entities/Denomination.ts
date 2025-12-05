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
 *     Denomination:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         entityNumber:
 *           type: string
 *         language:
 *           type: string
 *           nullable: true
 *         typeOfDenomination:
 *           type: string
 *           nullable: true
 *         denomination:
 *           type: string
 *           nullable: true
 */

@Entity()
export class Denomination {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.denominations, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  language!: string | null;

  @Column("text", { nullable: true })
  typeOfDenomination!: string | null;

  @Column("text", { nullable: true })
  denomination!: string | null;
}
