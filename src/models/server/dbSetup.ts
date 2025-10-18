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
  } catch (error: any) {
    // creating new DB if not exist already
    console.log("Creating new DB", error);
    try {
      // IMPORTANT: await DB creation before creating tables/columns
      await databases.create({
        databaseId: db,
        name: "db",
      });
    } catch (createErr: any) {
      // If already exists (race between requests), ignore
      if (createErr?.code !== 409) {
        console.error("Error creating database:", createErr?.message ?? createErr);
        throw createErr; // fail fast; dependent steps need the DB
      }
    }

    // Ensure DB is reachable before proceeding
    await databases.get({ databaseId: db });

    // Create tables/columns/indexes (idempotent in each helper)
    try {
      await Promise.all([
        createAnswerCollection(),
        createCommentCollection(),
        createQuestionCollection(),
        createVoteCollection(),
      ]);
      console.log("Collection created");
      console.log("Database connected");
    } catch (e: any) {
      if (e?.code !== 409) {
        console.error("Error creating schema:", e?.message ?? e);
      } else {
        console.log("One or more schema entities already exist, skipping creation.");
      }
    }
  }
  return databases;
}
