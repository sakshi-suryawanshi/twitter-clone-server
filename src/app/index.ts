import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
// import { typeDefs, resolvers } from './schema';
import bodyParser from 'body-parser';
import { prismaClient } from '../clients/db';
import { User } from './user';
import { graphqlContext } from '../interfaces';
import JWTService from '../services/jwt';

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());
  

  const graphqlServer = new ApolloServer<graphqlContext>({
    typeDefs : `
    ${User.types}

      type Query {
          ${User.queries}
      }
    `,

    resolvers : {
      Query: {
        ...User.resolvers.queries,
      },
      // Mutation: {},
    },
    
  });

  await graphqlServer.start();

  app.use('/graphql',expressMiddleware(graphqlServer, {context:
    async ({req, res}) => {
      return {
        user : req.headers.authorization? JWTService.decodeToken(req.headers.authorization.split("Bearer ")[1]): undefined,
        
      }
    }
  }));


  return app;  

}