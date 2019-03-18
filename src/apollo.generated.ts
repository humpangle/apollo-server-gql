export type Maybe<T> = T | null;

export interface GetMessageInput {
  text?: Maybe<string>;
}

export interface ConnectionInput {
  cursor?: Maybe<string>;

  limit?: Maybe<number>;
}

export interface CreateUserInput {
  username: string;

  email: string;

  password: string;

  firstName: string;

  lastName: string;
}

export interface LoginInput {
  username?: Maybe<string>;

  email?: Maybe<string>;

  password: string;
}

export interface CreateMessageInput {
  text: string;
}

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  me?: Maybe<User>;

  message?: Maybe<Message>;

  messages?: Maybe<MessageConnection[]>;
}

export interface User {
  id: string;

  username: string;

  email: string;

  insertedAt: Date;

  updatedAt: Date;

  messages?: Maybe<Message[]>;

  role: string;

  jwt: string;

  firstName: string;

  lastName: string;
}

export interface Message {
  id: string;

  text: string;

  sender: User;

  insertedAt: Date;

  updatedAt: Date;
}

export interface MessageConnection {
  pageInfo: PageInfo;

  edges: Message[];
}

export interface PageInfo {
  hasPrevious?: Maybe<boolean>;

  hasNext?: Maybe<boolean>;

  endCursor: string;

  startCursor: string;
}

export interface Mutation {
  createUser: User;

  login: User;

  createMessage: Message;
}

// ====================================================
// Arguments
// ====================================================

export interface MeQueryArgs {
  username?: Maybe<string>;

  email?: Maybe<string>;

  id?: Maybe<string>;
}
export interface MessageQueryArgs {
  input?: Maybe<GetMessageInput>;
}
export interface MessagesQueryArgs {
  input?: Maybe<ConnectionInput>;
}
export interface CreateUserMutationArgs {
  input: CreateUserInput;
}
export interface LoginMutationArgs {
  input: LoginInput;
}
export interface CreateMessageMutationArgs {
  input: CreateMessageInput;
}

import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";

import { User } from "./entity/user";

import { Message } from "./entity/message";

import { Context } from "./apollo-setup";

export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  TContext = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>;

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace QueryResolvers {
  export interface Resolvers<TContext = Context, TypeParent = {}> {
    me?: MeResolver<Maybe<User>, TypeParent, TContext>;

    message?: MessageResolver<Maybe<Message>, TypeParent, TContext>;

    messages?: MessagesResolver<
      Maybe<MessageConnection[]>,
      TypeParent,
      TContext
    >;
  }

  export type MeResolver<
    R = Maybe<User>,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, MeArgs>;
  export interface MeArgs {
    username?: Maybe<string>;

    email?: Maybe<string>;

    id?: Maybe<string>;
  }

  export type MessageResolver<
    R = Maybe<Message>,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, MessageArgs>;
  export interface MessageArgs {
    input?: Maybe<GetMessageInput>;
  }

  export type MessagesResolver<
    R = Maybe<MessageConnection[]>,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, MessagesArgs>;
  export interface MessagesArgs {
    input?: Maybe<ConnectionInput>;
  }
}

export namespace UserResolvers {
  export interface Resolvers<TContext = Context, TypeParent = User> {
    id?: IdResolver<string, TypeParent, TContext>;

    username?: UsernameResolver<string, TypeParent, TContext>;

    email?: EmailResolver<string, TypeParent, TContext>;

    insertedAt?: InsertedAtResolver<Date, TypeParent, TContext>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, TContext>;

    messages?: MessagesResolver<Maybe<Message[]>, TypeParent, TContext>;

    role?: RoleResolver<string, TypeParent, TContext>;

    jwt?: JwtResolver<string, TypeParent, TContext>;

    firstName?: FirstNameResolver<string, TypeParent, TContext>;

    lastName?: LastNameResolver<string, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type UsernameResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type EmailResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type InsertedAtResolver<
    R = Date,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type MessagesResolver<
    R = Maybe<Message[]>,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type RoleResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type JwtResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type FirstNameResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type LastNameResolver<
    R = string,
    Parent = User,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
}

export namespace MessageResolvers {
  export interface Resolvers<TContext = Context, TypeParent = Message> {
    id?: IdResolver<string, TypeParent, TContext>;

    text?: TextResolver<string, TypeParent, TContext>;

    sender?: SenderResolver<User, TypeParent, TContext>;

    insertedAt?: InsertedAtResolver<Date, TypeParent, TContext>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = Message,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type TextResolver<
    R = string,
    Parent = Message,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type SenderResolver<
    R = User,
    Parent = Message,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type InsertedAtResolver<
    R = Date,
    Parent = Message,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = Message,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
}

export namespace MessageConnectionResolvers {
  export interface Resolvers<
    TContext = Context,
    TypeParent = MessageConnection
  > {
    pageInfo?: PageInfoResolver<PageInfo, TypeParent, TContext>;

    edges?: EdgesResolver<Message[], TypeParent, TContext>;
  }

  export type PageInfoResolver<
    R = PageInfo,
    Parent = MessageConnection,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type EdgesResolver<
    R = Message[],
    Parent = MessageConnection,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
}

export namespace PageInfoResolvers {
  export interface Resolvers<TContext = Context, TypeParent = PageInfo> {
    hasPrevious?: HasPreviousResolver<Maybe<boolean>, TypeParent, TContext>;

    hasNext?: HasNextResolver<Maybe<boolean>, TypeParent, TContext>;

    endCursor?: EndCursorResolver<string, TypeParent, TContext>;

    startCursor?: StartCursorResolver<string, TypeParent, TContext>;
  }

  export type HasPreviousResolver<
    R = Maybe<boolean>,
    Parent = PageInfo,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type HasNextResolver<
    R = Maybe<boolean>,
    Parent = PageInfo,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type EndCursorResolver<
    R = string,
    Parent = PageInfo,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
  export type StartCursorResolver<
    R = string,
    Parent = PageInfo,
    TContext = Context
  > = Resolver<R, Parent, TContext>;
}

export namespace MutationResolvers {
  export interface Resolvers<TContext = Context, TypeParent = {}> {
    createUser?: CreateUserResolver<User, TypeParent, TContext>;

    login?: LoginResolver<User, TypeParent, TContext>;

    createMessage?: CreateMessageResolver<Message, TypeParent, TContext>;
  }

  export type CreateUserResolver<
    R = User,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, CreateUserArgs>;
  export interface CreateUserArgs {
    input: CreateUserInput;
  }

  export type LoginResolver<
    R = User,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, LoginArgs>;
  export interface LoginArgs {
    input: LoginInput;
  }

  export type CreateMessageResolver<
    R = Message,
    Parent = {},
    TContext = Context
  > = Resolver<R, Parent, TContext, CreateMessageArgs>;
  export interface CreateMessageArgs {
    input: CreateMessageInput;
  }
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  Context
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  Context
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  Context
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}

export type IResolvers<TContext = Context> = {
  Query?: QueryResolvers.Resolvers<TContext>;
  User?: UserResolvers.Resolvers<TContext>;
  Message?: MessageResolvers.Resolvers<TContext>;
  MessageConnection?: MessageConnectionResolvers.Resolvers<TContext>;
  PageInfo?: PageInfoResolvers.Resolvers<TContext>;
  Mutation?: MutationResolvers.Resolvers<TContext>;
  Date?: GraphQLScalarType;
};

export type IDirectiveResolvers<Result> = {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
};
