import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import { readFileSync } from 'fs';
import expressPlayground  from "graphql-playground-middleware-express";
import { MongoClient } from "mongodb";
import { resolvers } from './resolvers';


async function startApolloServer() {
  const typeDefs = readFileSync(__dirname + '/schema/typeDefs.graphql', 'utf-8');

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

