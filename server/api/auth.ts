import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { generateToken, hashPassword, hashToken } from "../auth-utils";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email";

export function registerAuthRoutes(app: Express) {
  app.post(api.auth.signup.path, async (req, res, next) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const verificationToken = generateToken();
      const verificationTokenHash = hashToken(verificationToken);

      const user = await storage.createUser({ ...input, password: hashedPassword });
      await storage.setVerificationToken(user.id, verificationTokenHash);
      await sendVerificationEmail(user.email, verificationToken);

      return res.status(201).json({
        message: "Account created. Check your email to verify your account before logging in.",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passport = require("passport");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) return next(loginErr);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      return res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  app.get(api.auth.verifyEmail.path, async (req, res, next) => {
    try {
      const query = z
        .object({ token: z.string().min(1, "Verification token is required") })
        .parse(req.query);

      const tokenHash = hashToken(query.token);
      const user = await storage.getUserByVerificationToken(tokenHash);
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      await storage.markEmailAsVerified(user.id);
      return res.json({ message: "Email verified successfully. You can now sign in." });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return next(err);
    }
  });

  app.post(api.auth.forgotPassword.path, async (req, res, next) => {
    try {
      const input = api.auth.forgotPassword.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);

      if (user) {
        const resetToken = generateToken();
        const resetTokenHash = hashToken(resetToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await storage.setResetPasswordToken(user.id, resetTokenHash, expiresAt);
        await sendPasswordResetEmail(user.email, resetToken);
      }

      return res.json({
        message: "If an account exists for that email, a password reset link has been sent.",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return next(err);
    }
  });

  app.post(api.auth.resetPassword.path, async (req, res, next) => {
    try {
      const input = api.auth.resetPassword.input.parse(req.body);
      const tokenHash = hashToken(input.token);
      const user = await storage.getUserByValidResetToken(tokenHash);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const newHashedPassword = await hashPassword(input.password);
      await storage.updateUserPassword(user.id, newHashedPassword);
      await storage.clearResetPasswordToken(user.id);

      return res.json({ message: "Password updated successfully. You can now sign in." });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return next(err);
    }
  });
}
