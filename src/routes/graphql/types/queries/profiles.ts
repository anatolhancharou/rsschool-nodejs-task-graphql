import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from '../uuid.js';
import { Profile } from '@prisma/client';
import { Context } from '../types.js';
import { userType } from './users.js';
import { MemberEnumType, memberObjType } from './member-types.js';

export const profileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    user: {
      type: userType,
      resolve: async (source: Profile, _, context: Context) => {
        return await context.prisma.user.findUnique({
          where: {
            id: source.userId,
          },
        });
      },
    },
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    memberType: {
      type: new GraphQLNonNull(memberObjType),
      resolve: async (source: Profile, _, context: Context) => {
        return await context.loaders.memberTypeLoader.load(source.memberTypeId);
      },
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberEnumType),
    },
  }),
});

export const profile = {
  type: profileType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: Profile, context: Context) => {
    return await context.prisma.profile.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export const profiles = {
  type: new GraphQLList(profileType),
  resolve: async (_, _args, context: Context) => {
    return await context.prisma.profile.findMany();
  },
};
