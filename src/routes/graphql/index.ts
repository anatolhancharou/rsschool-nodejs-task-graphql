import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { graphQLSchema } from './graphql-schema.js';
import depthLimit from 'graphql-depth-limit';
import { createLoaders } from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const loaders = createLoaders(prisma);

      const errors = validate(graphQLSchema, parse(query), [depthLimit(5)]);

      if (errors.length) {
        return { errors };
      }

      return graphql({
        schema: graphQLSchema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          loaders,
        },
      });
    },
  });
};

export default plugin;
