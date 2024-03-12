import { Hono } from "hono";

import routes from "./routes/index";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());

app.route("/", routes);

export default app;
