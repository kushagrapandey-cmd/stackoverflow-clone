/* eslint-disable @typescript-eslint/no-explicit-any */
import { Permission } from "node-appwrite";
import { db, voteCollection } from "../name";
import { databases } from "./config";

export default async function createVoteCollection() {
  try {
    //creating table
    await databases.createTable({
      databaseId: db,
      tableId: voteCollection,
      name: voteCollection,
      permissions: [
        Permission.create("users"),
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ],
    });

    console.log("Vote Collection Created");
  } catch (error:any) {
    console.log("Error creating voteCollection", error.message)
  }

  //creating columns
  const columnPromise = [
    databases.createStringColumn({
        databaseId : db,
        tableId : voteCollection,
        key : "typeId",
        size : 50,
        required : true
    }),

    databases.createEnumColumn({
        databaseId : db,
        tableId : voteCollection,
        key : "type",
        elements : ["question", "answer"],
        required : true
    }),

    databases.createEnumColumn({
        databaseId : db,
        tableId : voteCollection,
        key : "voteStatus",
        elements : ["upvoted", "downvoted"],
        required : true
    }),

    databases.createStringColumn({
        databaseId : db,
        tableId : voteCollection,
        key : "votedById",
        size : 50,
        required : true
    })

  ]

    try {
        await Promise.all(columnPromise);
        console.log("Question Columns created");
    } catch (error:any) {
        if (error.code !== 409) {
            console.error("Error creating columns:", error.message);
        } else {
            console.log("One or more columns already exist, skipping creation.");
        }
    }


}
