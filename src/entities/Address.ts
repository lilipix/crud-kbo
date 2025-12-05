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
 *     Code:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           description: Unique NACE or category code
 *           example: "01110"
 *         category:
 *           type: string
 *           nullable: true
 *           description: Category of the code
 *           example: "Agriculture"
 *         language:
 *           type: string
 *           nullable: true
 *           description: Language indicator (ex: FR, NL)
 *           example: "FR"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Label or meaning of the code
 *           example: "Culture de céréales (à l'exclusion du riz)"
 */

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  entityNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.addresses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entityNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  typeOfAddress!: string | null;

  @Column("text", { nullable: true })
  countryFR!: string | null;

  @Column("text", { nullable: true })
  zipcode!: string | null;

  @Column("text", { nullable: true })
  streetFR!: string | null;

  @Column("text", { nullable: true })
  houseNumber!: string | null;

  @Column("text", { nullable: true })
  box!: string | null;

  @Column("text", { nullable: true })
  dateStrikingOff!: string | null;
}
