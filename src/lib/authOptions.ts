import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {

    async signIn(signInProps) {
      let { user} = signInProps;

        const {  email, name, image } = user;

        let existingUser = await prisma.user.findFirst({
          where: {
             email: email!,
          },
        });


        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: email as string,
              name: name as string,
              image:image || 'https://avatars.githubusercontent.com/u/124599?v=4',
              emailVerified:  new Date(),
            },
          });
        }
   

      return true;
    },

    async jwt(jwtProps) {
      const { token, user, trigger, session } = jwtProps;
      if (trigger === 'update') {
        return {
          ...token,
          ...session.user,
        };
      }
      if (user && user.email && user.name) {
        const loggedInUser = await prisma.user.findFirst({
          where: { email: user.email },
        });

        if (!loggedInUser) return null;
          
        token.id = loggedInUser.id;
        token.name = user.name;
        token.email = user.email;
        token.emailVerified = loggedInUser.emailVerified;
        token.image = loggedInUser.image;
      }

      return token;
    },

    session({ session, token }) {
      if (token && session && session.user) {
        session.user.id = token.id;
        //@ts-ignore
        session.user.emailVerified = token.emailVerified ;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/',
  },
} satisfies NextAuthOptions;

