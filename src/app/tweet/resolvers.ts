import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { graphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content:string,
    imageURL?:string;
}


const mutations = {
  createTweet : async(
    parent:any, {payload} : {payload: CreateTweetPayload}, contextValue : graphqlContext
  ) => {
        
        if(!contextValue.user) throw new Error("You are not Authenticated!");
        
        
        const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author : {connect: { id: contextValue.user.id}},
      }});

      return tweet;
  },
};

const queries = {
  getAllTweets : (parent: any, contextValue:graphqlContext) => {
    
    const tweets =  prismaClient.tweet.findMany({orderBy: {createdAt: "desc"}});

      return tweets;
  },
}

const extraResolvers = {
  Tweet: {
    author: (parent:Tweet) => prismaClient.user.findUnique({where: {id: parent.authorId}})
  }
}


export const resolvers = { queries, mutations, extraResolvers}