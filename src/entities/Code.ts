import { Entity, PrimaryColumn, Column } from "typeorm";

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
