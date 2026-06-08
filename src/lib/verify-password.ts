import { createServerFn } from "@tanstack/react-start";

export const verifyPassword = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return { ok: false, error: "Not configured" };
    return { ok: ctx.data.password === adminPassword };
  },
);
