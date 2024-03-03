import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { memberType, memberTypes } from './types/queries/member-types.js';
import { post, posts } from './types/queries/posts.js';
import { user, users } from './types/queries/users.js';
import { profile, profiles } from './types/queries/profiles.js';

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

export const graphQLSchema = new GraphQLSchema({
  query: rootQuery,
});
