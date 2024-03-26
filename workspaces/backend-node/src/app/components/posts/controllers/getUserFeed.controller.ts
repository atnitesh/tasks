import { prisma } from '../../../../loaders/prisma';
import { withSchema } from '../../../core/withSchema';
import { withCache } from '../../../../utils/withCache';
import { logger } from '../../../../utils/logger';
import { Type } from '@sinclair/typebox';

const PAGE_LIMIT = 10;

const getFeedSchema = {
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
  }),
};

async function fetchUserFeed(userId: any, page: number) {
  const offset = (page - 1) * PAGE_LIMIT;

  const followings = await prisma.follow.findMany({
    where: { follower_id: userId },
    select: { following_id: true },
  });

  if (!followings.length) return [];

  const followingIds = followings.map((follow: { following_id: any; }) => follow.following_id);

  return await prisma.post.findMany({
    where: {
      author_id: { in: followingIds },
      deleted_at: null,
      visibility: { not: 'private' },
      OR: [{ published_at: { lte: new Date() } }, { published_at: null }],
    },
    orderBy: { created_at: 'desc' },
    skip: offset,
    take: PAGE_LIMIT,
  });
}

export default withSchema({
  schema: getFeedSchema,
  async handler(req: { query: { page: number; }; user: { id: any; }; }, reply: { send: (arg0: { posts: any; }) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; }): void; new(): any; }; }; }) {
    try {
      const page = req.query.page || 1;
      const userId = req.user.id;
      const cacheKey = `user:${userId}:feed:page:${page}`;

      const posts = await withCache({
        key: cacheKey,
        ex: 900, // Cache for 15 minutes
        fn: () => fetchUserFeed(userId, page),
      });

      reply.send({ posts });
    } catch (error) {
      logger.error(`Failed to fetch user feed: ${error}`);
      reply.status(500).send({ error: 'Failed to fetch user feed' });
    }
  },
});
