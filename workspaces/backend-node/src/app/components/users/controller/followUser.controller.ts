import prisma from "../../../../loaders/prisma"
import logger from "../../../../utils/logger"
import withSchema from "../../../core/withSchema"
import { Type } from "@sinclair/typebox"

export default withSchema({
  schema: {
    params: Type.Object({
      id: Type.String(),
    }),
  },
  async handler(req, reply) {
    const followerId = req.user!.id
    const followingId = req.params.id

    if (followerId === followingId) {
      return reply.badRequest("Cannot follow yourself")
    }

    try {
      const userAlreadyFollows = await prisma.follow.findFirst({
        where: {
          follower_id: followerId,
          following_id: followingId,
        },
      })
      
      if (userAlreadyFollows) {
        return reply.badRequest("Already following this user")
      }
      const follows = await prisma.follow.create({
        data: {
          follower_id: followerId,
          following_id: followingId,
        },
      })
      
      return {
        follows,
      }
    }
    catch (err) {
      logger.error({
        err,
      });
      return reply.send(err);
    }
  },
})
