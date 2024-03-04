import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { memberType, memberTypes } from './types/queries/member-types.js';
import { post, posts } from './types/queries/posts.js';
import { user, users } from './types/queries/users.js';
import { profile, profiles } from './types/queries/profiles.js';
import { changePost, createPost, deletePost } from './types/mutations/posts.js';
import {
  changeUser,
  createUser,
  deleteUser,
  subscribeTo,
  unsubscribeFrom,
} from './types/mutations/users.js';
import {
  changeProfile,
  createProfile,
  deleteProfile,
} from './types/mutations/profiles.js';

const rootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberType,
    memberTypes,
    post,
    posts,
    user,
    users,
    profile,
    profiles,
  }),
});

const rootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createPost,
    changePost,
    deletePost,
    createUser,
    changeUser,
    deleteUser,
    createProfile,
    changeProfile,
    deleteProfile,
    subscribeTo,
    unsubscribeFrom,
  }),
});

export const graphQLSchema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation,
});
