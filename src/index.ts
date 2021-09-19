import { ApolloServer, gql, } from "apollo-server";
import internal = require("stream");


const typeDefs = gql`
type User {
  githubLogin: ID!
  name: String
  avatar: String
  postedPhotos: [Photo!]!
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

const users = [
  { 'githubLogin' : 'mHattrup', 'name': 'Mike Hattrup'},
  { 'githubLogin' : 'gPlake', 'name': 'Glen Plake'},
  { 'githubLogin' : 'sSchmldt', 'name': 'Scot Schmidt'}
]

let _id = 0;
const photos: any[] = [
  {
    "id": "1",
    "name": "hogehoge",
    "description": "hogehoge",
    "category": "ACTION",
    "githubUser": "gPlake"
  },
  {
    "id": "2",
    "name": "foo",
    "description": "bar",
    "category": "SELFIE",
    "githubUser": "sSchmldt"
  },
  {
    "id": "3",
    "name": "bar",
    "description": "barbar",
    "category": "LANDSCAPE",
    "githubUser": "sSchmldt"
  }
];

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
    url: (parent:any) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent:any) =>  users.find(u => u.githubLogin === parent.githubUser)
  },
  User: {
    postedPhotos: (parent:any) => photos.filter(p => p.githubUser === parent.githubLogin)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
