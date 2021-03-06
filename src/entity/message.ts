import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from "typeorm";
import { MinLength } from "class-validator";

import { User } from "./user";
import { RelayNode } from ".";

@Entity({
  name: "messages"
})
export class Message implements RelayNode {
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
  @JoinColumn({
    name: "user_id"
  })
  user: User;

  userId: string | number;

  cursor: string;

  constructor(args: MessageConstructorArgs = {}) {
    Object.entries(args).forEach(([attribute, attributeValue]) => {
      if (attributeValue) {
        if (attribute === "user_id") {
          attribute = "userId";
          attributeValue = +attributeValue;
        } else if (attribute === "inserted_at") {
          attribute = "insertedAt";
          attributeValue = new Date(attributeValue);
        } else if (attribute === "updated_at") {
          attribute = "updatedAt";
          attributeValue = new Date(attributeValue);
        }

        (this as MessageConstructorArgs)[
          attribute as keyof MessageConstructorArgs
        ] = attributeValue;
      }
    });
  }
}

export interface MessageConstructorArgs {
  user?: User;

  content?: string;

  userId?: string | number;

  user_id?: string | number;
}

export const MESSAGE_RAW_PRIMARY_COLUMNS = [
  "user_id",
  "id",
  "content",
  "inserted_at",
  "updated_at"
];

export const MESSAGE_ENTITY_PRIMARY_COLUMNS = [
  "userId",
  "id",
  "content",
  "insertedAt",
  "updatedAt"
];
