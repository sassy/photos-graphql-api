import { ApolloServer, gql, } from "apollo-server";
import internal = require("stream");


const typeDefs = gql`
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
}

input PostPhotoInput {
  name: String!
  category: PhotoCategory=PORTRAIT
  description: String
}

type Query {
  totalPhotos: Int!
  allPhotos: [Photo!]!
}

type Mutation {
  postPhoto(input: PostPhotoInput!): Photo!
}
`;

let _id = 0;
const photos: any[] = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto(parent: any, args: any) {
      const newPhoto = {
        id: _id++,
        ...args.input
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
