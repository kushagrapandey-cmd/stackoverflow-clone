/* eslint-disable @typescript-eslint/no-explicit-any */
// The Appwrite SDK now uses object arguments instead of positional arguments 
// to avoid deprecation warnings and improve readability.

import { IndexType, Permission } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

// This function sets up the Question Table (formerly Collection)
// and its associated Columns (formerly Attributes) and Indexes.

export default async function createQuestionCollection() {
    console.log("Starting table creation and column setup...");

    // 1. Create Table (formerly Collection)
    try {
        // CONVERTED: Using object argument { databaseId, tableId, name, permissions }
        await databases.createTable({
            databaseId: db, // databaseId: The ID of your database
            tableId: questionCollection, // tableId: The unique ID for the table (e.g., 'questions')
            name: questionCollection, // name: The human-readable name of the table
            permissions: [ // permissions: An array of permission strings
                Permission.read("any"),
                Permission.read("users"),
                Permission.create("users"),
                Permission.update("users"),
                Permission.delete("users"),
            ],
        });
        console.log("Question table is created");
    } catch (error:any) {
        // 409 Conflict typically means the resource already exists. Log error only if it's unexpected.
        if (error.code !== 409) {
            console.error("Error creating Question table:", error.message);
        } else {
            console.log("Question table already exists, skipping creation.");
        }
    }

    // 2. Creating Columns (formerly Attributes)
    console.log("Creating Question columns...");
    const attributePromises = [
        // CONVERTED: Using object argument { databaseId, tableId, key, size, required, ... }
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: questionCollection, 
            key: "title", 
            size: 100, 
            required: true 
        }),
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: questionCollection, 
            key: "content", 
            size: 10000, 
            required: true 
        }),
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: questionCollection, 
            key: "authorId", 
            size: 50, 
            required: true 
        }),
        
        // Tags column requires 'array' to be set to true
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: questionCollection, 
            key: "tags", 
            size: 50, 
            required: true,
            array: true 
        }),
        
        // Attachment ID is not required (required: false)
        databases.createStringColumn({ 
            databaseId: db, 
            tableId: questionCollection, 
            key: "attachmentId", 
            size: 50, 
            required: false 
        }),
    ];

    try {
        await Promise.all(attributePromises);
        console.log("Question Columns created");
    } catch (error:any) {
        if (error.code !== 409) {
            console.error("Error creating Question columns:", error.message);
        } else {
            console.log("One or more question columns already exist, skipping creation.");
        }
    }

    // 3. Create Indexes
    console.log("Creating Indexes...");
    const indexPromises = [
        // CONVERTED: Using object argument { databaseId, tableId, key, type, columns }
        
        // Fulltext Index for searching within 'title'
        databases.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "index_title_fulltext", // indexId
            type: IndexType.Fulltext,
            columns: ["title"],
        }),
        
        // Fulltext Index for searching within 'content'
        databases.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "index_content_fulltext", // indexId
            type: IndexType.Fulltext,
            columns: ["content"],
        }),
        
        // Key Index for 'authorId' for efficient filtering by user
        databases.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "index_authorId_key", // indexId
            type: IndexType.Key,
            columns: ["authorId"],
        })
    ];

    try {
        await Promise.all(indexPromises);
        console.log("Question Indexes created");
    } catch (error:any) {
        if (error.code !== 409) {
            console.error("Error creating indexes:", error.message);
        } else {
            console.log("One or more indexes already exist, skipping creation.");
        }
    }
}
