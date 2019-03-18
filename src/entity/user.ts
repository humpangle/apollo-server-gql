import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { IsEmail } from "class-validator";

import { Message } from "./message";
import { EMAIL_INVALID_FORMAT_ERROR } from "../context.utils";

interface UserConstructor {
  username: string;
  email: string;
  name?: string;
  id?: number;
  passwordHash?: string;
}

@Entity({
  name: "users"
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  username: string;

  @IsEmail({}, { message: EMAIL_INVALID_FORMAT_ERROR })
  @Column({
    unique: true
  })
  email: string;

  @Column({
    name: "password_hash"
  })
  passwordHash: string;

  @Column({
    name: "name",
    nullable: true
  })
  name?: string;

  @CreateDateColumn({
    name: "inserted_at"
  })
  insertedAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];

  jwt?: string;

  constructor(params: UserConstructor = {} as UserConstructor) {
    Object.entries(params).forEach(([attr, value]) => {
      if (value) {
        (this as UserConstructor)[attr as keyof UserConstructor] = value;
      }
    });
  }
}

export interface UserObject {
  id: number;
  username: string;
  email: string;
  name?: string;
}

export function toUserObjectLiteral(
  user: User
): { [k in keyof UserObject]: User[k] } {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name
  };
}
