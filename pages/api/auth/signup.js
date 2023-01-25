import { hashPassword } from "../../../lib/auth";
import { connectToDataBase } from "../../../lib/db";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.json({ message: "Invalid Method" });
  }
  try {
    const { email, password } = req.body;

    if (!email || !email.includes("@")) {
      return res
        .status(422)
        .json({ message: "invalid email", eror: { email } });
    }

    if (!password.trim()) {
      return res
        .status(422)
        .json({ message: "invalid password", eror: { password } });
    }

    const client = await connectToDataBase();

    const db = client.db();

    const isUserExists = db.collection("users").findOne({ email });
    if (isUserExists) {
      res.status(422).json({ message: "Email already taken!" });
      client.close();
      return;
    }

    const hashedPassword = await hashPassword(password);

    const data = { email, password: hashedPassword };
    console.log({ data });

    const result = await db.collection("users").insertOne(data);

    console.log({ result });

    return res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.log({ msg: "error signup.js", error });

    return res.status(500).json({ message: "Server Error", error });
  }
}
export default handler;
