import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { Context } from '../types.js';
import { MemberTypeId } from '../../../member-types/schemas.js';
import { UUIDType } from '../uuid.js';
import { MemberEnumType } from '../queries/member-types.js';
import { profileType } from '../queries/profiles.js';

interface ProfileInputData {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: MemberTypeId;
    userId: string;
  };
}

interface ChangeProfileInputData {
  id: string;
  dto: Omit<ProfileInputData['dto'], 'userId'>;
}

const createProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberEnumType),
    },
  }),
});

const changeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    memberTypeId: {
      type: MemberEnumType,
    },
  }),
});

export const createProfile = {
  type: profileType,
  args: {
    dto: {
      type: new GraphQLNonNull(createProfileInputType),
    },
  },
  resolve: async (_, args: ProfileInputData, context: Context) => {
    return await context.prisma.profile.create({
      data: args.dto,
    });
  },
};

export const deleteProfile = {
  type: GraphQLString,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: Context) => {
    await context.prisma.profile.delete({
      where: {
        id: args.id,
      },
    });

    return 'ok';
  },
};

export const changeProfile = {
  type: profileType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(changeProfileInputType),
    },
  },
  resolve: async (_, args: ChangeProfileInputData, context: Context) => {
    return await context.prisma.profile.update({
      where: { id: args.id },
      data: args.dto,
    });
  },
};
