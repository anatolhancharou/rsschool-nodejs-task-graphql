import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { Context } from '../types.js';
import { userType } from '../queries/users.js';
import { UUIDType } from '../uuid.js';

interface UserInputData {
  dto: {
    name: string;
    balance: number;
  };
}

interface ChangeUserInputData extends UserInputData {
  id: string;
}

interface SubscriptionInputData {
  userId: string;
  authorId: string;
}

const userInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
});

const changeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  }),
});

export const createUser = {
  type: userType,
  args: {
    dto: {
      type: new GraphQLNonNull(userInputType),
    },
  },
  resolve: async (_, args: UserInputData, context: Context) => {
    return await context.prisma.user.create({
      data: args.dto,
    });
  },
};

export const deleteUser = {
  type: GraphQLString,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: Context) => {
    await context.prisma.user.delete({
      where: {
        id: args.id,
      },
    });

    return 'ok';
  },
};

export const changeUser = {
  type: userType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(changeUserInputType),
    },
  },
  resolve: async (_, args: ChangeUserInputData, context: Context) => {
    return await context.prisma.user.update({
      where: { id: args.id },
      data: args.dto,
    });
  },
};

export const subscribeTo = {
  type: userType,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: SubscriptionInputData, context: Context) => {
    return await context.prisma.user.update({
      where: { id: args.userId },
      data: {
        userSubscribedTo: {
          create: {
            authorId: args.authorId,
          },
        },
      },
    });
  },
};

export const unsubscribeFrom = {
  type: GraphQLString,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: SubscriptionInputData, context: Context) => {
    await context.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          authorId: args.authorId,
          subscriberId: args.userId,
        },
      },
    });

    return 'ok';
  },
};
