import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from '../uuid.js';
import { Context } from '../types.js';
import { User } from '@prisma/client';
import { profileType } from './profiles.js';
import { postType } from './posts.js';

interface UserSubscriptions {
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
}

export interface UserWithSubscriptions extends User, UserSubscriptions {}

export const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: profileType,
      resolve: async (source: User, _, context: Context) => {
        return await context.loaders.profileLoader.load(source.id);
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (source: User, _, context: Context) => {
        return await context.loaders.postLoader.load(source.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (source: UserWithSubscriptions, _, context: Context) => {
        return await context.loaders.userSubscribedToLoader.load(source.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (source: UserWithSubscriptions, _, context: Context) => {
        return await context.loaders.subscribedToUserLoader.load(source.id);
      },
    },
  }),
});

export const user = {
  type: userType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: User, context: Context) => {
    return await context.prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export const users = {
  type: new GraphQLList(userType),
  resolve: async (_, _args, context: Context) => {
    return await context.prisma.user.findMany();
  },
};
