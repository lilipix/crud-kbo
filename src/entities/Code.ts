import { Entity, PrimaryColumn, Column, Check } from "typeorm";

@Entity()
@Check(`"language" IN ('FR', 'NL', 'DE', 'EN') OR "language" IS NULL`)
export class Code {
  @PrimaryColumn({ type: "varchar", length: 20 })
  code!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  category!: string | null;

  @Column({ type: "varchar", length: 2, nullable: true })
  language!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;
}
