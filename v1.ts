import { AppInstance } from "."
import authRoutes from "./components/auth/auth.routes"
import postsRoutes from "./components/posts/posts.routes"
import userRoutes from "./components/users/users.routes"
import authRequiredHook from "./hooks/authRequired.hook"
export default async function v1Routes(app: AppInstance) {
  app.register(authRoutes, { prefix: "/auth" })
  app.register(async (app) => {
    app.addHook("preHandler", authRequiredHook)
    app.register(postsRoutes, { prefix: "/posts" })
    app.register(userRoutes, { prefix: "/users" })
  })
}
