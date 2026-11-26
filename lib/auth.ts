import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    // Accounts must verify their email with the 6-digit code before they can sign in (see lib/verification.ts).
    requireEmailVerification: true,
    autoSignIn: false,
  },
  // Verification emails are sent by our own code flow (6-digit code), not by better-auth's link emails.
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    sendVerificationEmail: async () => {},
  },
  // Google / Facebook sign-in. A button only appears when its keys are set in the environment.
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
      : {}),
    ...(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
      ? {
          facebook: {
  clientId: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  mapProfileToUser: (profile) => {
    const p = profile as unknown as Record<string, unknown>;
    const rawId = p?.id ?? p?.sub;
    const fbId = typeof rawId === "string" || typeof rawId === "number"
      ? String(rawId)
      : `${Date.now()}`;

    const rawEmail = typeof p?.email === "string" ? p.email.trim() : "";
    const email = rawEmail.length > 0 ? rawEmail : `fb_${fbId}@rigmarket.local`;

    const rawName = typeof p?.name === "string" ? p.name.trim() : "";
    const name = rawName.length > 0 ? rawName : "Facebook User";

    const pictureObj =
      p?.picture && typeof p.picture === "object"
        ? (p.picture as { data?: { url?: unknown } })
        : undefined;
    const image =
      typeof p?.picture === "string"
        ? p.picture
        : typeof pictureObj?.data?.url === "string"
          ? pictureObj.data.url
          : undefined;

    return {
      email,
      name,
      image,
      emailVerified: true,
    };
  },
},
        }
      : {}),
  },
  // Same email on password + Google/Facebook = one account instead of a duplicate.
  account: {
    accountLinking: { enabled: true, trustedProviders: ['google', 'facebook'] },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false,
      },
      // The primary admin: the only admin who can promote other accounts to admin.
      isOwner: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // The very first account becomes the store admin so the marketplace
        // can be bootstrapped without manual database edits.
        before: async (newUser) => {
          const { rows } = await pool.query<{ count: string }>(
            `SELECT COUNT(*)::text AS count FROM "user" WHERE role = 'admin'`,
          )
          const role = rows[0]?.count === '0' ? 'admin' : 'user'
          return { data: { ...newUser, role } }
        },
        // The very first admin of a brand-new site is also the primary admin (existing sites get it from the migration).
        after: async (created) => {
          await pool.query(
            `UPDATE "user" SET "isOwner" = true WHERE "id" = $1 AND "role" = 'admin' AND NOT EXISTS (SELECT 1 FROM "user" WHERE "isOwner" = true)`,
            [created.id],
          )
        },
      },
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL
            ? [`https://${process.env.VERCEL_URL}`]
            : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    // "Remember me" keeps you signed in for 30 days; without it the session ends when the browser closes.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
