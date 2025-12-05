import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Enterprise } from "./Enterprise";

/**
 * @openapi
 * components:
 *   schemas:
 *     Establishment:
 *       type: object
 *       properties:
 *         establishmentNumber:
 *           type: string
 *         startDate:
 *           type: string
 *           nullable: true
 *         enterpriseNumber:
 *           type: string
 */

@Entity()
export class Establishment {
  @PrimaryColumn("text")
  establishmentNumber!: string;

  @Column("text")
  enterpriseNumber!: string;

  @ManyToOne(() => Enterprise, (e) => e.establishments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "enterpriseNumber" })
  enterprise?: Enterprise | null;

  @Column("text", { nullable: true })
  startDate!: string | null;
}
