import { MongoClient } from "mongodb";

export async function connectToDataBase() {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017/auth");
    return client;
  } catch (error) {
    console.log({ msg: "error db.js", error });
    throw error;
  }
}
