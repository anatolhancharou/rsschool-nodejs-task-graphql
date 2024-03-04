import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { MemberTypeId } from '../../../member-types/schemas.js';
import { MemberType } from '@prisma/client';
import { Context } from '../types.js';
import { profileType } from './profiles.js';

export const MemberEnumType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    [MemberTypeId.BASIC]: {
      value: MemberTypeId.BASIC,
    },
    [MemberTypeId.BUSINESS]: {
      value: MemberTypeId.BUSINESS,
    },
  },
});

export const memberObjType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(MemberEnumType),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: async (source: MemberType, _, context: Context) => {
        return await context.prisma.profile.findMany({
          where: {
            id: source.id,
          },
        });
      },
    },
  }),
});

export const memberType = {
  type: memberObjType,
  args: {
    id: {
      type: new GraphQLNonNull(MemberEnumType),
    },
  },
  resolve: async (_, args: MemberType, context: Context) => {
    return await context.prisma.memberType.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

export const memberTypes = {
  type: new GraphQLList(memberObjType),
  resolve: async (_, _args, context: Context) => {
    return await context.prisma.memberType.findMany();
  },
};
