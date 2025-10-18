/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

import { databases } from "./config";

export default async function getOrCreateDB() {
  try {
    await databases.get({ databaseId: db });
    console.log("Database connected");
  } catch (error) {
    //creating new DB if not exist already
    console.log("Creating new DB", error);
    try {
      databases.create({
        databaseId: db,
        name: "db",
      });
      await Promise.all([
        createAnswerCollection(),
        createCommentCollection(),
        createQuestionCollection(),
        createVoteCollection(),
      ]);

      console.log("Collection created");
      console.log("Database connected");
    } catch (error: any) {
      if (error.code !== 409) {
        console.error("Error creating columns:", error.message);
      } else {
        console.log("One or more columns already exist, skipping creation.");
      }
    }
  }
  return databases;
}
