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
        return await context.prisma.profile.findUnique({
          where: {
            userId: source.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (source: User, _, context: Context) => {
        return await context.prisma.post.findMany({
          where: {
            authorId: source.id,
          },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (source: User, _, context: Context) => {
        return await context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: source.id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (source: User, _, context: Context) => {
        return await context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: source.id,
              },
            },
          },
        });
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
