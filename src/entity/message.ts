import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { MinLength } from "class-validator";

import { User, UserObject } from "./user";

@Entity({
  name: "messages"
})
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @MinLength(1, {
    message: "is required."
  })
  @Column({
    type: "text"
  })
  content: string;

  @CreateDateColumn({
    name: "inserted_at"
  })
  insertedAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @ManyToOne(type => User, user => user.messages, {
    onDelete: "CASCADE",
    nullable: false
  })
  sender: User;

  constructor(args: MessageConstructorArgs = {}) {
    Object.entries(args).forEach(([messageAttribute, attributeValue]) => {
      if (attributeValue) {
        this[messageAttribute as keyof MessageConstructorArgs] = attributeValue;
      }
    });
  }
}

export interface MessageConstructorArgs {
  sender?: User | UserObject;
  content?: string;
}
