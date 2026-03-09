/**
 * Authentication Routes
 * -------------------------------------------------------
 * This file defines all authentication-related API routes:
 *
 * - Signup
 * - Login
 * - Logout
 * - Get current user
 * - Email verification
 * - Forgot password
 * - Reset password
 *
 * The system uses:
 * - Express for routing
 * - Passport.js for authentication
 * - Zod for request validation
 * - Secure token generation for verification/reset
 */

import type { Express } from "express";
import { z } from "zod";
import passport from "passport"; // Passport authentication middleware

import { api } from "@shared/routes";
import { storage } from "../storage";

// Utility helpers
import { generateToken, hashPassword, hashToken } from "../auth-utils";

// Email sending utilities
import { sendPasswordResetEmail, sendVerificationEmail } from "../email";

/**
 * Registers all authentication routes to the Express app
 */
export function registerAuthRoutes(app: Express) {

  /**
   * -------------------------------------------------------
   * SIGNUP ROUTE
   * -------------------------------------------------------
   * Creates a new user account and sends an email
   * verification link.
   */
  app.post(api.auth.signup.path, async (req, res, next) => {
    try {
      // Validate incoming request body using Zod schema
      const input = api.auth.signup.input.parse(req.body);

      // Check if a user with this email already exists
      const existingUser = await storage.getUserByEmail(input.email);

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password securely before storing
      const hashedPassword = await hashPassword(input.password);

      // Generate email verification token
      const verificationToken = generateToken();
      const verificationTokenHash = hashToken(verificationToken);

      // Create user in database
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      // Store verification token in database
      await storage.setVerificationToken(user.id, verificationTokenHash);

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      return res.status(201).json({
        message:
          "Account created. Check your email to verify your account before logging in.",
      });
    } catch (err) {
      // Handle validation errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return next(err);
    }
  });


  /**
   * -------------------------------------------------------
   * LOGIN ROUTE
   * -------------------------------------------------------
   * Uses Passport.js local strategy to authenticate users.
   */
  app.post(api.auth.login.path, (req, res, next) => {

    passport.authenticate("local", (err: any, user: any, info: any) => {

      if (err) return next(err);

      // If authentication failed
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Login failed" });
      }

      // Prevent login if email not verified
      if (!user.emailVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in.",
        });
      }

      // Create session after login
      req.login(user, (loginErr: any) => {
        if (loginErr) return next(loginErr);

        return res.json(user);
      });

    })(req, res, next);
  });


  /**
   * -------------------------------------------------------
   * LOGOUT ROUTE
   * -------------------------------------------------------
   * Ends the user session.
   */
  app.post(api.auth.logout.path, (req, res, next) => {

    req.logout((err) => {
      if (err) return next(err);

      return res.json({ success: true });
    });

  });


  /**
   * -------------------------------------------------------
   * CURRENT USER ROUTE
   * -------------------------------------------------------
   * Returns the currently authenticated user.
   */
  app.get(api.auth.me.path, (req, res) => {

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.json(req.user);
  });


  /**
   * -------------------------------------------------------
   * EMAIL VERIFICATION ROUTE
   * -------------------------------------------------------
   * Verifies the email using a secure token sent via email.
   */
  app.get(api.auth.verifyEmail.path, async (req, res, next) => {

    try {

      const query = z
        .object({
          token: z.string().min(1, "Verification token is required"),
        })
        .parse(req.query);

      const tokenHash = hashToken(query.token);

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(tokenHash);

      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      // Mark email as verified
      await storage.markEmailAsVerified(user.id);

      return res.json({
        message: "Email verified successfully. You can now sign in.",
      });

    } catch (err) {

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return next(err);
    }
  });


  /**
   * -------------------------------------------------------
   * FORGOT PASSWORD ROUTE
   * -------------------------------------------------------
   * Sends a password reset link to the user's email.
   */
  app.post(api.auth.forgotPassword.path, async (req, res, next) => {

    try {

      const input = api.auth.forgotPassword.input.parse(req.body);

      const user = await storage.getUserByEmail(input.email);

      // If user exists, generate reset token
      if (user) {

        const resetToken = generateToken();
        const resetTokenHash = hashToken(resetToken);

        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await storage.setResetPasswordToken(
          user.id,
          resetTokenHash,
          expiresAt
        );

        await sendPasswordResetEmail(user.email, resetToken);
      }

      // Always return same response (security best practice)
      return res.json({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

    } catch (err) {

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return next(err);
    }
  });


  /**
   * -------------------------------------------------------
   * RESET PASSWORD ROUTE
   * -------------------------------------------------------
   * Updates the user's password using a reset token.
   */
  app.post(api.auth.resetPassword.path, async (req, res, next) => {

    try {

      const input = api.auth.resetPassword.input.parse(req.body);

      const tokenHash = hashToken(input.token);

      // Find user with valid reset token
      const user = await storage.getUserByValidResetToken(tokenHash);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Hash the new password
      const newHashedPassword = await hashPassword(input.password);

      // Update user password
      await storage.updateUserPassword(user.id, newHashedPassword);

      // Remove reset token
      await storage.clearResetPasswordToken(user.id);

      return res.json({
        message: "Password updated successfully. You can now sign in.",
      });

    } catch (err) {

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return next(err);
    }
  });
}