import prisma from "../../../../loaders/prisma";
import withSchema from "../../../core/withSchema";
import logger from "../../../../utils/logger"

const schema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
};

export default withSchema({
  schema,
  async handler(req: { user: any; params: { id: any; }; }, reply: any) {
    const followerId = req.user!.id;
    const followingId = req.params.id;

    // Check if the user itself exists, if not, return bad request
    if (!followerId) {
      return reply.badRequest("User not found.");
    }

    // Check if the user is trying to follow themselves
    if (followerId === followingId) {
      return reply.badRequest("You cannot follow yourself.");
    }

    try {
          // Check if the user to follow exists
      const userToFollow = await prisma.user.findUnique({
        where: { id: followingId },
      });
      if (!userToFollow) {
        return reply.notFound("User to follow not found.");
      }
  
      // Check if the follow relationship already exists
      const existingFollow = await prisma.follow.findFirst({
        where: {
          follower_id: followerId,
          following_id: followingId,
        },
      });
      if (existingFollow) {
        return reply.badRequest("You are already following this user.");
      }
  
      // Create the follow relationship
      await prisma.follow.create({
        data: {
          follower_id: followerId,
          following_id: followingId,
        },
      });
  
      return reply.status(201).send({ success: true, message: "Follow successful." });
    } catch (err) {
      logger.error({
        err,
      });
      return reply.send(err);
    }
  },
});
