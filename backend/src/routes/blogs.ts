import { Hono } from "hono";

import userRoutes from "./users";

const blogsRoute = new Hono();

blogsRoute.post("/", (c) => {
	return c.text("Hello Hono!");
});

blogsRoute.put("/", (c) => {
	return c.text("Hello Hono!");
});

blogsRoute.get("/:id", (c) => {
	return c.text("Hello Hono!");
});

blogsRoute.get("/bulk", (c) => {
	return c.text("Hello Hono!");
});

export default blogsRoute;
