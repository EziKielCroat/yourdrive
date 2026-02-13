import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { AuthService } from "../services/auth.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/auth/oauth/google/callback`,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email provided by Google"));
        }

        const user = await AuthService.findOrCreateSocialUser(
          "google",
          profile.id,
          email,
          {
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          },
        );

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/auth/oauth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.local`;

        const user = await AuthService.findOrCreateSocialUser(
          "github",
          profile.id,
          email,
          {
            firstName: profile.displayName || profile.username || "User",
            username: profile.username,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          },
        );

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/auth/oauth/facebook/callback`,
      profileFields: ["id", "emails", "name", "picture"],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email provided by Facebook"));
        }

        const user = await AuthService.findOrCreateSocialUser(
          "facebook",
          profile.id,
          email,
          {
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          },
        );

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { prisma } = await import("../lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
