import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from '../uuid.js';
import { Context } from '../types.js';
import { Post } from '@prisma/client';
import { userType } from './users.js';

export const postType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    author: {
      type: new GraphQLNonNull(userType),
      resolve: async (source: Post, _, context: Context) => {
        return await context.prisma.user.findUnique({
          where: {
            id: source.authorId,
          },
        });
      },
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  }),
});

export const post = {
  type: postType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: Post, context: Context) => {
    return await context.prisma.post.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export const posts = {
  type: new GraphQLList(postType),
  resolve: async (_, _args, context: Context) => {
    return await context.prisma.post.findMany();
  },
};
