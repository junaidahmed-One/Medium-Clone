import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

import userRoutes from "./users";

const blogsRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

blogsRoute.get("/bulk", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const posts = await prisma.post.findMany({});
		return Response.json(posts);
	} catch (error) {
		console.log(error);
		return Response.json({
			message: "Error while fetching logs",
		});
	}
});

blogsRoute.use("/*", async (c, next) => {
	const header = await c.req.header("Authorization");
	console.log(header);
	if (!header) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = header.split(" ")[1];

	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	//@ts-ignore
	c.set("userId", payload.id);
	await next();
});

blogsRoute.post("/", async (c) => {
	const body = await c.req.json();
	const userId = c.get("userId");
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const post = await prisma.post.create({
			//@ts-ignore
			data: {
				title: body.title,
				content: body.content,
				published: body.pusblished,
				authorId: userId,
			},
		});

		console.log("userId : ", userId);

		return Response.json({
			postId: post.id,
			message: "Blog Posted!",
		});
	} catch (error) {
		console.log(error);
		return Response.json({
			message: "Error while posting the blog",
		});
	}
});

blogsRoute.put("/update/:id", async (c) => {
	const body = await c.req.json();
	const postId = await c.req.param("id");

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const post = await prisma.post.update({
			where: {
				id: postId,
			},
			data: {
				title: body.title,
				content: body.content,
				published: body.published,
			},
		});
		return Response.json({
			message: "Updated Successfully",
		});
	} catch (error) {}
	return c.text("Hello Hono!");
});

blogsRoute.get("/:id", async (c) => {
	const postId = await c.req.param("id");

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const post = await prisma.post.findUnique({
			where: {
				id: postId,
			},
		});
		return Response.json(post);
	} catch (error) {
		return Response.json({
			message: "Error while fetching blog",
		});
	}
});

export default blogsRoute;
