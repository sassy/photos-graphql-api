import { ApolloServer, gql, } from "apollo-server";


interface Photo {
  url: string;
  name: string;
  description: string;
}

const typeDefs = gql`
type Photo {
  id: ID!
  url: String!
  name: String!
  description: String
}

type Query {
  totalPhotos: Int!
  allPhotos: [Photo!]!
}

type Mutation {
  postPhoto(name: String!  description: String): Photo!
}
`;

let _id = 0;
const photos: Photo[] = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto(parent: any, args: Photo) {
      const newPhoto = {
        id: _id++,
        ...args
      }
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  Photo: {
    url: (parent:any) => `http://yoursite.com/img/${parent.id}.jpg`
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
