import gql from "graphql-tag";

export const CREATE_MESSAGE_MUTATION = gql`
  mutation CreateAMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      insertedAt
      updatedAt
      user {
        id
      }
    }
  }
`;

export const LIST_MESSAGES_QUERY = gql`
  query ListMessages($input: ConnectionInput) {
    messages(input: $input) {
      edges {
        cursor

        node {
          id
          content
          insertedAt
          updatedAt
          user {
            id
            jwt
          }
        }
      }

      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
`;
