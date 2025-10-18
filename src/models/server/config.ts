import env from "@/app/env"
// NOTE: We replace 'Databases' with 'TablesDB' in the import statement
import {Avatars, TablesDB, Storage, Users, Client} from "node-appwrite"

// 1. Initialize the Appwrite Client
const client = new Client();

client
    // Read Appwrite configuration from your environment object
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint URL
    .setProject(env.appwrite.projectId) // Your project ID
    // Use .setKey() for server-side initialization
    .setKey(env.appwrite.apikey) // Your secret API key
;

// 2. Initialize the Service Objects
const users = new Users(client);
// We use the modern TablesDB class for all database operations
// and assign it to the 'databases' variable name to maintain compatibility
const databases = new TablesDB(client);
const avatars = new Avatars(client);
const storage = new Storage(client);

// 3. Export the initialized services
export { client , storage , databases , users , avatars}