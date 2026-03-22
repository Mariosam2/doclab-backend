import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';
import { getEnvOrThrow } from '@src/shared/helpers';

passport.use(
  new GoogleStrategy(
    {
      clientID: getEnvOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: getEnvOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${getEnvOrThrow('BASE_URL')}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleImageUrl = profile.photos?.[0]?.value ?? null;
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            tokenVersion: { increment: 1 },
            username: profile.displayName,
            firstname: profile.name?.givenName ?? '',
            lastname: profile.name?.familyName ?? '',
          },
          create: {
            googleId: profile.id,
            email: profile.emails?.[0]?.value ?? '',
            username: profile.displayName,
            firstname: profile.name?.givenName ?? '',
            lastname: profile.name?.familyName ?? '',
            ...(googleImageUrl && {
              image: {
                create: {
                  filename: 'google-avatar',
                  url: googleImageUrl,
                },
              },
            }),
          },
        });

        return done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { userId: id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});
