import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
type Query {
  totalPhotos: Int!
}
`;

const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
