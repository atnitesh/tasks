Codebase Walkthrough: tasks-main/workspaces/backend-node

This codebase appears to be the backend for a social media application built with Node.js and Prisma. The structure and functionality is as follows

Structure:

`scripts`: Contains scripts for generating data and tokens.

`src`: Contains the main source code for the application.

`app`: Houses the application logic.

`components`: Feature-specific modules.

`auth`: Handles authentication (login, signup).

`posts`: Manages posts (create, feed).

`users`: Handles user interactions (follow).

`core`: Core functionalities and utilities.

`hooks`: Application-wide hooks (e.g., authRequired).

`index.ts`: Entry point for the application.

`loaders`: Initializes dependencies like Prisma and Redis.

`services`: Reusable services like token generation and redis client.

`utils`: Utility functions for logging, error handling, etc.

Functionality:

`scripts/generate.ts`: Generates fake users, follows, and posts for testing purposes.

`scripts/ipsum.ts`: Generates random text using predefined words and phrases.

`scripts/token.ts`: Generates an authentication token for a specific user.

`app/components/auth`: Handles user authentication with login and signup routes.

`app/components/posts`: Provides routes for creating posts and retrieving user feed.

`app/components/users`: Currently has a placeholder for follow functionality.

`app/core/fastifyPlugin.ts`: Custom plugin for Fastify to manage request IDs and context.

`app/core/withSchema.ts`: Helper function for defining routes with TypeBox schemas.

`app/hooks/authRequired.hook.ts`: Verifies authentication tokens and attaches user data to requests.

`app/index.ts`: Initializes the Fastify app, registers plugins and routes, and sets up error handling.

`app/v1.ts`: Defines the API version 1 routes, including auth and posts (with auth required).

`config.ts`: Stores application configuration like port number, Redis connection details, and JWT secret.

`index.ts`: Starts the server and handles errors.

`loaders/index.ts`: Initializes dependencies like Redis and Prisma.

`loaders/prisma.ts`: Creates a Prisma client instance and logs queries for debugging.

`services/redis.ts`: Provides access to Redis client with key prefixing.

`services/token.ts`: Generates JWT authentication tokens for users.

`utils`: Contains various utility functions for error handling, logging, sleep, caching, etc.

