import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type Bindings = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  REDIRECT_URI: string;
  CORS_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: [c.env.CORS_ORIGIN],
  });
  return await corsMiddleware(c, next);
});

app.post("/api/auth/google", async (c) => {
  const { code } = await c.req.json();
  if (!code) return c.json({ error: "Code is required" }, 400);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  if (!response.ok)
    return c.json(data, response.status as ContentfulStatusCode);

  return c.json(data);
});

app.post("/api/auth/google/refresh", async (c) => {
  const { refresh_token } = await c.req.json();
  if (!refresh_token)
    return c.json({ error: "Refresh token is required" }, 400);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok)
    return c.json(data, response.status as ContentfulStatusCode);

  return c.json(data);
});

app.post("/api/auth/github", async (c) => {
  const { code } = await c.req.json();
  if (!code) return c.json({ error: "Code is required" }, 400);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  if (!response.ok)
    return c.json(data, response.status as ContentfulStatusCode);

  return c.json(data);
});

app.post("/api/auth/github/refresh", async (c) => {
  const { refresh_token } = await c.req.json();
  if (!refresh_token)
    return c.json({ error: "Refresh token is required" }, 400);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok)
    return c.json(data, response.status as ContentfulStatusCode);

  return c.json(data);
});

export default app;
