import type { Express, Request, Response } from "express";
import { hashPassword, verifyPassword, createSessionToken } from "../auth";
import * as db from "../db";
import * as email from "../email";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const existing = await db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const passwordHash = await hashPassword(password);
      const isAdmin = ENV.adminEmails.includes(email.toLowerCase());
      const user = await db.createUser({ email, name: name || null, passwordHash, role: isAdmin ? "admin" : "user" });

      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      const token = await createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });

      // Send welcome email (non-blocking)
      email.sendWelcomeEmail({ to: user.email, name: user.name }).catch((err: unknown) =>
        console.error("[Auth] Failed to send welcome email:", err)
      );
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await db.updateUserLastSignedIn(user.id);

      // Auto-promote admin email if not already admin
      const isAdmin = ENV.adminEmails.includes(email.toLowerCase());
      if (isAdmin && user.role !== 'admin') {
        await db.updateUserRole(user.id, 'admin');
        user.role = 'admin';
      }

      const token = await createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
