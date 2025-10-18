/* eslint-disable @typescript-eslint/no-explicit-any */
import { Permission } from "node-appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

// This function checks if the Question Attachment Bucket exists and creates it if it doesn't.
export default async function getOrCreateStorage() {
    try {
        // First, attempt to retrieve the bucket.
        await storage.getBucket({ bucketId: questionAttachmentBucket });
        console.log("Storage Connected");
    } catch (error: any) {
        // If retrieval fails (likely 404 Not Found), create the bucket.
        console.log("Creating new bucket", error);
        try {
            // CONVERTED: Using the object argument structure for createBucket
            await storage.createBucket({
                bucketId: questionAttachmentBucket,
                name: questionAttachmentBucket,
                permissions: [
                    // Define access controls for the bucket
                    Permission.create("users"), // Users can upload files
                    Permission.read("any"),    // Anyone (users or guests) can view files
                    Permission.read("users"),  // Explicitly for authenticated users
                    Permission.update("users"),// Users can update their own files
                    Permission.delete("users"),// Users can delete their own files
                ],
                // Set fileSecurity to false to allow public access via 'Permission.read("any")'
                fileSecurity: false, 
                // List of file extensions allowed for upload
                allowedFileExtensions: ["jpg", "png", "gif", "jpeg", "webp", "heic"],
                // Other optional parameters (like enabled or maximumFileSize) are omitted 
                // since they were undefined in the original call and use defaults.
            });

            console.log("Storage Created");
            console.log("Storage Connected");
        } catch (error) {
            console.error("Error creating storage:", error);
        }
    }
}
