import { Entity, PrimaryColumn, Column } from "typeorm";

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
          language:
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
export class Code {
  @PrimaryColumn("text")
  code!: string;

  @Column("text", { nullable: true })
  category!: string | null;

  @Column("text", { nullable: true })
  language!: string | null;

  @Column("text", { nullable: true })
  description!: string | null;
}
