/* eslint-disable @typescript-eslint/no-explicit-any */
// The Appwrite SDK now uses object arguments instead of positional arguments 
// to avoid deprecation warnings and improve readability.

import { Permission } from "node-appwrite";
import { db, answerCollection } from "../name";
import { databases } from "./config";

// This function sets up the Question Table (formerly Collection)
// and its associated Columns (formerly Attributes) and Indexes.

export default async function createAnswerCollection() {
    console.log("Starting table creation and column setup...");

    // 1. Create Table (formerly Collection)
    try {
        // CONVERTED: Using object argument { databaseId, tableId, name, permissions }
        await databases.createTable({
            databaseId: db, // databaseId: The ID of your database
            tableId: answerCollection, // tableId: The unique ID for the table (e.g., 'questions')
            name: answerCollection, // name: The human-readable name of the table
            permissions: [ // permissions: An array of permission strings
                Permission.read("any"),
                Permission.read("users"),
                Permission.create("users"),
                Permission.update("users"),
                Permission.delete("users"),
            ],
        });
        console.log("Answer table is created");
    } catch (error:any) {
        // 409 Conflict typically means the resource already exists. Log error only if it's unexpected.
        if (error.code !== 409) {
            console.error("Error creating table:", error.message);
        } else {
            console.log("Answer table already exists, skipping creation.");
        }
    }

    // 2. Creating Columns (formerly Attributes)
    console.log("Creating columns...");
    const attributePromises = [
        // CONVERTED: Using object argument { databaseId, tableId, key, size, required, ... }
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: answerCollection, 
            key: "content", 
            size: 10000, 
            required: true 
        }),
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: answerCollection, 
            key: "questionId", 
            size: 50, 
            required: true 
        }),
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: answerCollection, 
            key: "authorId", 
            size: 50, 
            required: true 
        })
        
    ];

    try {
        await Promise.all(attributePromises);
        console.log("Answer Columns created");
    } catch (error:any) {
        if (error.code !== 409) {
            console.error("Error creating columns:", error.message);
        } else {
            console.log("One or more columns already exist, skipping creation.");
        }
    }

}
