
import { GraphQLScalarType } from "graphql";
import dayjs from 'dayjs';
import { Context } from "apollo-server-core";
import { Db, MongoClient } from "mongodb";
import axios from "axios";

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

const requestGithubToken = (credentials: any) => 
  axios(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json'
        },
        data: JSON.stringify(credentials)
      }
  )
  .then(res => res.data)
  .catch(error => {
    throw new Error(JSON.stringify(error));
  });
  
const requestGithubUserAccount = (token: string) => 
  axios(`https://api.github.com/user`,
    {
        headers: {
            "Authorization": `token ${token}`
        }
    })
    .then(res => res.data)
    .catch(error => {
        throw new Error(JSON.stringify(error));
      });

async function authorizeWithGithub(credentials: any) {
    const {access_token} = await requestGithubToken(credentials);
    const githubUser = await requestGithubUserAccount(access_token);

    return {...githubUser, access_token};
}

export const resolvers = {
    Query: {
        totalPhotos: (parent: any, args: any, { db }:Context<{db: Db}>) => 
            db.collection('photos').estimatedDocumentCount(),
        allPhotos:  (parent: any, args: any, { db }:Context<{db: Db}>) => 
            db.collection('photos').find().toArray(),
        totalUsers:  (parent: any, args: any, { db }:Context<{db: Db}>) => 
            db.collection('users').estimatedDocumentCount(),
        allUsers:  (parent: any, args: any, { db }:Context<{db: Db}>) => 
            db.collection('users').find().toArray()
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
      },
      githubAuth: async(parent:any, { code}: any, {db  }: Context<{db:Db}>) => {
        let {
            message,
            access_token,
            avatar_url,
            login,
            name
        } = await authorizeWithGithub({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code
        });
        if (message) {
            throw new Error(message);
        }
        let latestUserInfo = {
            name,
            githubLogin: login,
            githubAccessToken: access_token,
            avatar: avatar_url
        }
        const update_result = await db
            .collection('users')
            .replaceOne({githubLogin: login}, latestUserInfo, {upsert: true});

        return {user: latestUserInfo, token: access_token}
      },
      addFakeUsers: async(root: any, {count}:any, {db  }: Context<{db:Db}>) => {
        const randomUserApi = `https://randomuser.me/api/?results=${count}`;

        
        const {results} = await axios.get(randomUserApi)
            .then(res => res.data);

        const users =  results.map((r:any) => ({
                githubLogin: r.login.username,
                name: `${r.name.first} ${r.name.last}`,
                avatar: r.picture.thumbnail,
                githubToken: r.login.sha1
        }));

        await db .collection('users').bulkWrite([{
            insertOne: {
                document: {
                    users: users
                }
            }
        }]);

        return users;
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
    }),
    
  };
  