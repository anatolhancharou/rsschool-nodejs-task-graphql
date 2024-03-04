import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLString,
} from 'graphql';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
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
  resolve: async (_, _args, context: Context, resolveInfo: GraphQLResolveInfo) => {
    const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
    const { fields } = simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfoFragment as ResolveTree,
      new GraphQLList(userType),
    );

    const hasSubscribedToUserField = 'subscribedToUser' in fields;
    const hasUserSubscribedToField = 'userSubscribedTo' in fields;

    const users = await context.prisma.user.findMany({
      include: {
        subscribedToUser: hasSubscribedToUserField,
        userSubscribedTo: hasUserSubscribedToField,
      },
    });

    users.forEach((user) => {
      if (hasSubscribedToUserField) {
        const ids = user.subscribedToUser.map((u) => u.subscriberId);
        context.loaders.subscribedToUserLoader.prime(
          user.id,
          users.filter((u) => ids.includes(u.id)),
        );
      }

      if (hasUserSubscribedToField) {
        const ids = user.userSubscribedTo.map((u) => u.authorId);
        context.loaders.userSubscribedToLoader.prime(
          user.id,
          users.filter((u) => ids.includes(u.id)),
        );
      }
    });

    return users;
  },
};
