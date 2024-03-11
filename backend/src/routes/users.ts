import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

const userRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

userRoutes.post("/signup", (c) => {
	const body = c.req.json();

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	return c.text("Hello Hono!");
});

userRoutes.post("/signin", (c) => {
	return c.text("Hello Hono!");
});

export default userRoutes;
