import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { UUIDType } from '../uuid.js';
import { postType } from '../queries/posts.js';
import { Context } from '../types.js';

interface PostInputData {
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

interface ChangePostInputData {
  id: string;
  dto: Omit<PostInputData['dto'], 'authorId'>;
}

const createPostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  }),
});

const changePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
  }),
});

export const createPost = {
  type: postType,
  args: {
    dto: {
      type: new GraphQLNonNull(createPostInputType),
    },
  },
  resolve: async (_, args: PostInputData, context: Context) => {
    return await context.prisma.post.create({
      data: args.dto,
    });
  },
};

export const deletePost = {
  type: GraphQLString,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: Context) => {
    await context.prisma.post.delete({
      where: {
        id: args.id,
      },
    });

    return 'ok';
  },
};

export const changePost = {
  type: postType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(changePostInputType),
    },
  },
  resolve: async (_, args: ChangePostInputData, context: Context) => {
    return await context.prisma.post.update({
      where: { id: args.id },
      data: args.dto,
    });
  },
};
