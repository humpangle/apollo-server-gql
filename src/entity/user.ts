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

type UserConstructor = Partial<Exclude<User, "messages" | "jwt">>;

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

  @IsEmail()
  @Column({
    unique: true
  })
  email: string;

  @Column({
    name: "password_hash"
  })
  passwordHash: string;

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

  constructor(params: UserConstructor = {}) {
    Object.entries(params).forEach(([attr, value]) => {
      if (value) {
        this[attr as keyof UserConstructor] = value;
      }
    });
  }
}

type UserObject = Pick<
  User,
  "id" | "username" | "email" | "passwordHash" | "insertedAt" | "updatedAt"
>;

export function toUserObjectLiteral(
  user: User
): { [k in keyof UserObject]: UserObject[k] } {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    insertedAt: user.insertedAt,
    updatedAt: user.updatedAt
  };
}
