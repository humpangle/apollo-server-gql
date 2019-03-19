import gql from "graphql-tag";

export const CREATE_MESSAGE_MUTATION = gql`
  mutation CreateAMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      insertedAt
      updatedAt
      sender {
        id
      }
    }
  }
`;
