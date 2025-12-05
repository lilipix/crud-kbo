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
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         entityNumber:
 *           type: string
 *         activityGroup:
 *           type: string
 *           nullable: true
 *         naceVersion:
 *           type: string
 *           nullable: true
 *         naceCode:
 *           type: string
 *           nullable: true
 *         classification:
 *           type: string
 *           nullable: true
 */

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
