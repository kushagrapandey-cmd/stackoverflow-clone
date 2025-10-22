/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

// A utility function to update reputation (minimizes code duplication)
async function updateReputation(userId: string, change: number) {
    try {
        const authorPrefs = await users.getPrefs<UserPrefs>({userId: userId});
        const currentRep = Number(authorPrefs.reputation) || 0;

        await users.updatePrefs<UserPrefs>({
            userId: userId,
            // Uses a simple number addition for change: +1 for upvote, -1 for downvote/undo
            prefs: {
                reputation: currentRep + change,
            },
        });
    } catch (e) {
        console.error("Failed to update user reputation:", e);
        // You might decide to throw or just log and continue, 
        // as the core voting logic still succeeded.
    }
}

export async function POST(request: NextRequest) {
    try {
        const { votedById, voteStatus, type, typeId } = await request.json();

        // 1. Find existing vote
        const response = await databases.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("votedById", votedById),
                Query.limit(1), // Optimization: only need to find one existing row
            ],
        });

        const existingVote = response.rows[0];
        const isNewVote = response.rows.length === 0;

        let message = "Voted";
        let repChange = 0;  // Represents the net change in author reputation (-2, -1, 0, +1, +2)


        // 2. Determine Action: Withdrawn, Changed, or New
        if (existingVote) {
            // A. Existing vote found

            if (existingVote.voteStatus === voteStatus) {
                // Scenario: Vote Withdrawn (user clicked the same status again)
                await databases.deleteRow({
                    databaseId: db,
                    tableId: voteCollection,
                    rowId: existingVote.$id,
                });
                
                // Undo the reputation change for the old vote
                repChange = existingVote.voteStatus === "upvoted" ? -1 : 1; 
                message = "Vote Withdrawn";

            } else {
                // Scenario: Vote Status Changed (e.g., upvote to downvote)
                // 1. Delete old vote
                await databases.deleteRow({
                    databaseId: db,
                    tableId: voteCollection,
                    rowId: existingVote.$id,
                });

                // 2. Create new vote
                await databases.createRow({
                    databaseId: db,
                    tableId: voteCollection,
                    rowId: ID.unique(),
                    data: { type, typeId, voteStatus, votedById },
                });
                
                // Rep change: -1 for undoing old vote, then +1 or -1 for new vote.
                // Up->Down: (-1) + (-1) = -2 | Down->Up: (+1) + (+1) = +2
                if (existingVote.voteStatus === "upvoted" && voteStatus === "downvoted") {
                    repChange = -2;
                } else { // downvoted to upvoted
                    repChange = 2; 
                }
                message = "Vote Status Updated";
            }

        } else if (!existingVote) {
            // B. No existing vote found (New Vote)
            await databases.createRow({
                databaseId: db,
                tableId: voteCollection,
                rowId: ID.unique(),
                data: { type, typeId, voteStatus, votedById },
            });
            
            // New reputation change
            repChange = voteStatus === "upvoted" ? 1 : -1;
            message = "Voted";
        }


        // 3. Update Author Reputation (Use the calculated net change)
        if (repChange !== 0) {
            const collectionId = type === "question" ? questionCollection : answerCollection;
            const questionOrAnswer = await databases.getRow({
                databaseId: db,
                tableId: collectionId,
                rowId: typeId,
            });

            if (questionOrAnswer) {
                await updateReputation(questionOrAnswer.authorId, repChange);
            } else {
                console.warn(`Target ${type} with ID ${typeId} not found for reputation update.`);
            }
        }


        // 4. Recalculate Total Votes (Final Step)
        const [upvotes, downvotes] = await Promise.all([
            databases.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries: [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                ],
            }),
            databases.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries: [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                ],
            }),
        ]);

        return NextResponse.json(
            {
                data: {
                    document: null, // The document from createRow is no longer needed here
                    voteResult: upvotes.total - downvotes.total,
                },
                message: message,
            },
            {
                status: isNewVote ? 201 : 200,
            }
        );
        
    } catch (error: any) {
        console.error("Voting API Error:", error);
        return NextResponse.json(
            { message: error?.message || "An unknown error occurred during voting" },
            { status: error?.status || error?.code || 500 }
        );
    }
}