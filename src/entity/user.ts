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
import { EMAIL_INVALID_FORMAT_ERROR } from "../contexts";

export interface UserConstructorArgs {
  username: string;
  email: string;
  name?: string;
  id?: number;
  passwordHash?: string;
  firstName: string;
  lastName: string;
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
    name: "first_name"
  })
  firstName: string;

  @Column({
    name: "last_name"
  })
  lastName: string;

  @CreateDateColumn({
    name: "inserted_at"
  })
  insertedAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @OneToMany(type => Message, message => message.user)
  messages: Message[];

  jwt?: string;

  constructor(params: UserConstructorArgs = {} as UserConstructorArgs) {
    Object.entries(params).forEach(([attr, value]) => {
      if (value) {
        (this as UserConstructorArgs)[
          attr as keyof UserConstructorArgs
        ] = value;
      }
    });
  }
}
