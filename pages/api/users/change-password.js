import { getSession } from "next-auth/client";

import { connectToDataBase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

async function handler(req, res) {
  try {
    if (req.method !== "PATCH") {
      return;
    }

    const session = await getSession({ req: req });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized access!" });
    }

    const userEmail = session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const client = await connectToDataBase();
    const usersCollection = client.db().collection("users");

    const userData = await usersCollection.findOne({ email: userEmail });
    if (!userData) {
      client.close();
      return res.status(404).json({ message: "User not found!" });
    }

    const currentPassword = userData.password;

    const passwordAreEqual = await verifyPassword(oldPassword, currentPassword);
    if (!passwordAreEqual) {
      client.close();
      return res.status(422).json({ message: "invalid old password!" });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const result = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { password: hashedNewPassword } }
    );

    client.close();
    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error!" });
  }
}

export default handler;
