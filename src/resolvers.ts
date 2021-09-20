
import { GraphQLScalarType } from "graphql";
import * as dayjs from 'dayjs';

// test data.
const users = [
    { 'githubLogin' : 'mHattrup', 'name': 'Mike Hattrup'},
    { 'githubLogin' : 'gPlake', 'name': 'Glen Plake'},
    { 'githubLogin' : 'sSchmldt', 'name': 'Scot Schmidt'}
  ];

const tags = [
    {"photoID": "1", "userID": "gPlake"},
    {"photoID": "2", "userID": "sSchmldt"},
    {"photoID": "2", "userID": "mHattrup"},
    {"photoID": "2", "userID": "gPlake"}
  ]
  
  let _id = 0;
  const photos: any[] = [
    {
      "id": "1",
      "name": "hogehoge",
      "description": "hogehoge",
      "category": "ACTION",
      "githubUser": "gPlake",
      "created": "3-28-1977"
    },
    {
      "id": "2",
      "name": "foo",
      "description": "bar",
      "category": "SELFIE",
      "githubUser": "sSchmldt",
      "created": "1-2-1985"
    },
    {
      "id": "3",
      "name": "bar",
      "description": "barbar",
      "category": "LANDSCAPE",
      "githubUser": "sSchmldt",
      "created": "2018-04-15T19:09:57.308Z"
    }
  ];
  
export const resolvers = {
    Query: {
      totalPhotos: () => photos.length,
      allPhotos: () => photos
    },
    Mutation: {
      postPhoto(parent: any, args: any) {
        const newPhoto = {
          id: _id++,
          ...args.input,
          created: dayjs()
        }
        photos.push(newPhoto);
        return newPhoto;
      }
    },
    Photo: {
      url: (parent:any) => `http://yoursite.com/img/${parent.id}.jpg`,
      postedBy: (parent:any) =>  users.find(u => u.githubLogin === parent.githubUser),
      taggedUsers: (parents:any) => tags
        .filter(tag => tag.photoID === parents.id)
        .map(tag => tag.userID)
        .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
      postedPhotos: (parent:any) => photos.filter(p => p.githubUser === parent.githubLogin),
      inPhotos: (parent: any) => tags
        .filter(tag => tag.userID === parent.id)
        .map(tag => tag.photoID)
        .map(photoID => photos.find(p => p.id === photoID))
    },
    DateTime: new GraphQLScalarType({
      name: `DateTime`,
      description: `A valid date time value`,
      parseValue: value => dayjs(value),
      serialize: value => dayjs(value).format(),
      parseLiteral: (ast:any) => ast.value
    })
  };
  