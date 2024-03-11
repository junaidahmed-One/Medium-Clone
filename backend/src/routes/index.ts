import { Hono } from "hono";

import userRoutes from "./users";
import blogRoutes from "./blogs";

const app = new Hono();

app.route("/api/v1/user", userRoutes);

app.route("/api/v1/blog", blogRoutes);

export default app;
