import { ApolloServer, gql, } from "apollo-server";


interface Photo {
  name: string;
  description: string;
}

const typeDefs = gql`
type Query {
  totalPhotos: Int!
}

type Mutation {
  postPhoto(name: String!  description: String): Boolean!
}
`;

const photos: Photo[] = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length
  },
  Mutation: {
    postPhoto(parent: any, args: Photo) {
      photos.push(args)
      return true
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
