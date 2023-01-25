import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDataBase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        console.log({ credentials });
        const client = await connectToDataBase();

        const usersCollection = client.db().collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });
        if (!user) {
          client.close();
          throw new Error("No user found!");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          client.close();
          throw new Error("Invalid Credentials");
        }

        client.close();
        return {
          id: user._id,
          email: credentials.email,
        };
      },
    }),
  ],
});
