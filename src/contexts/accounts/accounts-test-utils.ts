import gql from "graphql-tag";

import { CreateUserInput } from "../../apollo.generated";

export const CREATE_USER = gql`
  mutation CreateAUser($input: CreateUserInput!) {
    createUser(input: $input) {
      jwt
    }
  }
`;

export const USER_CREATION_DATA: CreateUserInput = {
  username: "123456",
  email: "a@b.com",
  password: "123456"
};

export const LOGIN_USER_MUTATION = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      id
      jwt
    }
  }
`;
