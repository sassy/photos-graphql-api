import { ApolloServer, gql, } from "apollo-server-express";
import * as express from "express";

import expressPlayground  from "graphql-playground-middleware-express";
import { MongoClient } from "mongodb";
import { resolvers } from './resolvers';

const typeDefs = gql`
scalar DateTime

type User {
  githubLogin: ID!
  name: String
  avatar: String
  postedPhotos: [Photo!]!
  inPhotos: [Photo!]!
}

enum PhotoCategory {
  SELFIE
  PORTRAIT
  ACTON
  LANDSCAPE
  GRAPHIC
}

type Photo {
  id: ID!
  url: String!
  name: String!
  description: String
  category: PhotoCategory!
  postedBy: User!
  taggedUsers: [User!]!
  created: DateTime!
}

input PostPhotoInput {
  name: String!
  category: PhotoCategory=PORTRAIT
  description: String
}

type Query {
  totalPhotos: Int!
  allPhotos(after: DateTime): [Photo!]!
}

type Mutation {
  postPhoto(input: PostPhotoInput!): Photo!
}
`;


async function startApolloServer() {
  const MONGO_DB = "mongodb://localhost:27017/test"
  const client = await MongoClient.connect(
    MONGO_DB,
  );
  const db = client.db();
  const context = {db};

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
  await server.start();

  const app = express();
  server.applyMiddleware({app});

  app.get('/', (req:express.Request, res: express.Response) => res.end('Welcome to Photo API'));
  app.get('/playground', expressPlayground({endpoint: '/graphql'}));

  await new Promise(resolve => app.listen({port: 4010}, () => {
    console.log(`🚀  Server ready at http://localhost:4010${server.graphqlPath}`);
  }));
  
  return {server, app};
}

startApolloServer();

