import { z } from 'zod';
import {
  insertUserSchema, users,
  insertAssessmentSchema, assessments,
  insertRecommendationSchema, recommendations,
  insertUserSkillSchema, userSkills,
  insertRoadmapSchema, roadmaps,
  signupSchema, loginSchema, submitAssessmentSchema, addSkillSchema, gapAnalysisRequestSchema, generateRoadmapRequestSchema,
  forgotPasswordSchema, resetPasswordSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/signup' as const,
      input: signupSchema,
      responses: {
        201: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    verifyEmail: {
      method: 'GET' as const,
      path: '/api/auth/verify-email' as const,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    },
    forgotPassword: {
      method: 'POST' as const,
      path: '/api/auth/forgot-password' as const,
      input: forgotPasswordSchema,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    },
    resetPassword: {
      method: 'POST' as const,
      path: '/api/auth/reset-password' as const,
      input: resetPasswordSchema,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    }
  },
  assessment: {
    submit: {
      method: 'POST' as const,
      path: '/api/assessment' as const,
      input: submitAssessmentSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/assessment' as const,
      responses: {
        200: z.array(z.custom<typeof assessments.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    }
  },
  recommendations: {
    get: {
      method: 'GET' as const,
      path: '/api/recommendations' as const,
      responses: {
        200: z.array(z.custom<typeof recommendations.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    generate: {
      method: 'POST' as const,
      path: '/api/recommendations/generate' as const,
      responses: {
        200: z.array(z.custom<typeof recommendations.$inferSelect>()),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      }
    },
    getById: {
      method: 'GET' as const,
      path: '/api/recommendations/:id' as const,
      responses: {
        200: z.custom<typeof recommendations.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  skills: {
    add: {
      method: 'POST' as const,
      path: '/api/skills' as const,
      input: addSkillSchema,
      responses: {
        201: z.custom<typeof userSkills.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/skills' as const,
      responses: {
        200: z.array(z.custom<typeof userSkills.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    gapAnalysis: {
      method: 'POST' as const,
      path: '/api/skills/gap-analysis' as const,
      input: gapAnalysisRequestSchema,
      responses: {
        200: z.object({
          skillsYouHave: z.array(z.string()),
          skillsYouNeed: z.array(z.string()),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  roadmap: {
    generate: {
      method: 'POST' as const,
      path: '/api/roadmap' as const,
      input: generateRoadmapRequestSchema,
      responses: {
        201: z.custom<typeof roadmaps.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/roadmap' as const,
      responses: {
        200: z.array(z.custom<typeof roadmaps.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SignupInput = z.infer<typeof api.auth.signup.input>;
export type LoginInput = z.infer<typeof api.auth.login.input>;
export type GapAnalysisResponse = z.infer<typeof api.skills.gapAnalysis.responses[200]>;
