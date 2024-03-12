import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signupInput } from "@100xdevsjunaid/mediumclonecommon";

const userRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

userRoutes.post("/signup", async (c) => {
	const body = await c.req.json();
	//console.log(body);
	const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(411);
		return c.json({
			message: "Inputs not correct",
		});
	}
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const user = await prisma.user.create({
			data: {
				email: body.username,
				password: body.password,
				name: body.name,
			},
		});

		const jwt = await sign(
			{
				id: user.id,
			},
			c.env.JWT_SECRET
		);

		return Response.json({
			token: jwt,
		});
	} catch (error) {
		console.log(error);
		return Response.json({
			message: "Error while signing up, Please signup again",
		});
	}
});

userRoutes.post("/signin", async (c) => {
	const body = await c.req.json();

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const user = await prisma.user.findUnique({
			where: {
				email: body.username,
				password: body.password,
			},
		});
		if (user) {
			const jwt = await sign(
				{
					id: user.id,
				},
				c.env.JWT_SECRET
			);

			return Response.json({
				token: jwt,
			});
		} else {
			return Response.json({
				message: "Couldn't find this user, Please signup",
			});
		}
	} catch (error) {
		console.log(error);
		return Response.json({
			message: "error while signing up",
		});
	}
});

export default userRoutes;
