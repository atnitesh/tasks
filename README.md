## Backend API Development with Node.js and TypeScript

### Introduction

The project is a simple social media application that allows users to create posts and follow each other.

### Walkthrough

**Directory Structure:**

The directory structure follows a modular approach, separating different functionalities into various folders:

- components: Contains API endpoints implementation grouped by functionality (login, signup, posts, etc.).
  Each endpoint has its own file and exports an endpoint handler function.
- core: Contains core functionalities used across different parts of the application.
  `withSchema` function is defined for handling request validation.
- loaders:
  - index.ts: Initializes loaders such as Redis and Prisma and implements a retry mechanism for connection establishment.
  - prisma.ts: Configures and exports a Prisma client instance with query logging.
- services:
  - redis.ts: Manages Redis connections and provides a function to get a prefixed Redis client.
  - token.ts: Handles the generation of authentication token using JWT. And utilizes prisma for creating device tokens
- utils:
  - withCache.ts: Implements a caching mechanism using Redis that looks for a key in cache, if found return the result else in case of cache-miss store the result in cache and then return the result.
  - withStaleWhileRevalidate.ts: Implements a caching strategy called "Stale-While-Revalidate."
- config.ts: Specifies the configuration settings for the application like port, JWT_SECRET, host, password etc.

**Key Components:**
API versioning is there to enable different versions of API (`api/v1`).

- Endpoints:
  Endpoints are organized in separate folders under the components folder for different functionalities (e.g., login, signup, create post, get user feed).

  - /api/v1/login and /api/v1/signup: Handle user authentication and registration and stores hash password of user using bcrypt library for security
  - /api/v1/posts/create: Creates a new post.
  - /api/v1/posts/feed: Retrieves a user's feed based on his/her followers, taking into account visibility and recent posts.
  - /api/v1/users/:id/follow: Allow users to follow some other user

- Database Schema:
  The database schema includes tables for users, device_tokens, follows, and posts, along with necessary constraints and foreign keys.

### Improvements

1. **Error Handling:**
   Ensure comprehensive error handling, especially in asynchronous operations like database connections and Redis interactions.
   Make use of try/catch to handle errors and exceptions during execution. Also it's better to have a centralized error handling mechanism that adheres to a specific format when sending error response like this

```bash
{
  "code": 404,
  "name": "Not found"
  "message": <Exact error message>
}
```

2. **Logging:**
   Logging is implemented using a centralized logger, which is good. But we also need to add appropriate logging during various parts of application when a user logins, when user follows each other etc. Also we can enable logging to support different severity levels like info, warn and error.

3. **Response structure:**
   Pre-defined response structures with proper status codes enables to send response adhering to a specific format when sending back response. This makes the response more structured, consistent and readable without having the need to define status code, name and message everytime.

4. **Configuration:**
   Consider to environment variables for sensitive data like JWT secrets by storing them in a separate .env file.

### Optimize /api/v1/posts/feed

**Caching**

- For the api to have better performance, we can use caching with the help of Redis to store and retrieve frequently accessed data, reducing the need to fetch it from the database or perform expensive computations repeatedly. Since getting user feed is going to be a frequent operation, it's a good idea to incorporate caching in the endpoint implementation.
  Caching mechanism is already in place to retrieve or set key-value pairs in redis. Let's leverage it.
- In `getUserFeed` controller method, `withCache` utility takes care of checking the cache and executing the provided function to fetch data if it's not found in the cache. The cache key is constructed based on the user's ID and the request parameters (page no.) to ensure uniqueness.
- The TTL is set to 15 minutes for near real-time updates, another improvement is the user feed cache can be invalidated for a user's followers whenever a new post is created by the user. So that updated results are always shown for a user feed. But this needs to be done wisely, we need to delete the posts results from cache for each follower of the user making a post.
In this way updated user feed will always be shown to the user while improving the performance time for response.

**Pagination**

- Another optimization to improve response time is to implement pagination to limit the number of records fetched in a single request. Since we can expect a large number of posts in a user feed, pagination will help to load the user feed faster by reducing the amt of data in a single request.
- As per the implementation, the database query was modified to evaluate the followingIds and then return a fixed no of posts based on page size from the total posts (irrespective of the following users). 
If pagination was added to the previous query it would result to give all posts corresponding to x(whatever the page size is) number of following users. And the posts count will vary for each page, hence not being consistent.
- In the modified query version, the page parameter is added to the querystring, and the skip and take options are used in the Prisma query to implement pagination. Default page size is 10.
Now, clients can make requests like `/api/v1/posts/feed?page=1` to get the first page with 10 posts, `/api/v1/posts/feed?page=2` for the second page, and so on.

Also we're making use of `published_at` column to show posts in the order they were created. However, I see `published_at` col is not getting populated at the time of post creation, value is null. Also we do not have a separate endpoint when a post is published, hence it's better to update `published_at` alongwith `created_at` date. Thus, I've used `created_at` field to show posts in desc order.

### Implement /api/v1/users/:id/follow

Implementation
- Request validation performed for `id` param that corresponds to following id
- Next comes the checks to be done before making a db query to follow each other
- Self-Follow Check:
  Ensures a user cannot follow themselves. If the follower ID is the same as the following ID, it returns a bad request response.
- Existing Follow Check:
  Queries the database to check if there is an existing follow relationship between the current user (follower) and the target user (following).
- If there's no existing follow relationship, it creates a new follow relationship 
