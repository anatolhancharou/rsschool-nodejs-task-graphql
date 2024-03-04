import { MemberType, Post, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';
import { UserWithSubscriptions } from './types/queries/users.js';

export interface DataLoaders {
  userSubscribedToLoader: DataLoader<string, UserWithSubscriptions[]>;
  subscribedToUserLoader: DataLoader<string, UserWithSubscriptions[]>;
  memberTypeLoader: DataLoader<string, MemberType>;
  profileLoader: DataLoader<string, Profile>;
  postLoader: DataLoader<string, Post[]>;
}

const getUserSubscribedToLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, UserWithSubscriptions[]>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: {
              in: ids as string[],
            },
          },
        },
      },
      include: {
        subscribedToUser: true,
      },
    });

    return ids.map((id) =>
      users.filter((user) =>
        user.subscribedToUser.some((user) => user.subscriberId === id),
      ),
    );
  });
};

const getSubscribedToUserLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, UserWithSubscriptions[]>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: {
              in: ids as string[],
            },
          },
        },
      },
      include: {
        userSubscribedTo: true,
      },
    });

    return ids.map((id) =>
      users.filter((user) => user.userSubscribedTo.some((user) => user.authorId === id)),
    );
  });
};

const getMemberTypeByIdLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, MemberType>(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: {
          in: ids as string[],
        },
      },
    });

    return ids.map((id) => memberTypes.find((type) => type.id === id) as MemberType);
  });
};

const getProfileByIdLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Profile>(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          in: ids as string[],
        },
      },
    });

    return ids.map((id) => profiles.find((profile) => profile.userId === id) as Profile);
  });
};

const getPostByIdLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Post[]>(async (ids) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: ids as string[],
        },
      },
    });

    return ids.map((id) => posts.filter((post) => post.authorId === id));
  });
};

export const createLoaders = (prisma: PrismaClient): DataLoaders => ({
  userSubscribedToLoader: getUserSubscribedToLoader(prisma),
  subscribedToUserLoader: getSubscribedToUserLoader(prisma),
  memberTypeLoader: getMemberTypeByIdLoader(prisma),
  profileLoader: getProfileByIdLoader(prisma),
  postLoader: getPostByIdLoader(prisma),
});
