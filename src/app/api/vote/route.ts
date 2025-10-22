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

export async function POST(request: NextRequest) {
  try {
    const { votedById, voteStatus, type, typeId } = await request.json();

    const response = await databases.listRows({
      databaseId: db,
      tableId: voteCollection,
      queries: [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("votedById", votedById),
      ],
    });

    if (response.rows.length > 0) {
      await databases.deleteRow({
        databaseId: db,
        tableId: voteCollection,
        rowId: response.rows[0].$id,
      });

      // Decrease the reputation of the question/answer author
      const questionOrAnswer = await databases.getRow({
        databaseId: db,
        tableId: type === "question" ? questionCollection : answerCollection,
        rowId: typeId,
      });

      const authorPrefs = await users.getPrefs<UserPrefs>(
        questionOrAnswer.authorId
      );

      await users.updatePrefs<UserPrefs>({
        userId: questionOrAnswer.authorId,
        prefs: {
          reputation:
            response.rows[0].voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1
              : Number(authorPrefs.reputation) + 1,
        },
      });
    }

    // that means prev vote does not exists or voteStatus changed
    if (response.rows[0]?.voteStatus !== voteStatus) {
      const doc = await databases.createRow({
        databaseId: db,
        tableId: voteCollection,
        rowId: ID.unique(),
        data: {
          type,
          typeId,
          voteStatus,
          votedById,
        },
      });

      // Increate/Decrease the reputation of the question/answer author accordingly
      const questionOrAnswer = await databases.getRow({
        databaseId: db,
        tableId: type === "question" ? questionCollection : answerCollection,
        rowId: typeId,
      });

      const authorPrefs = await users.getPrefs<UserPrefs>(
        questionOrAnswer.authorId
      );

      // if vote was present
      if (response.rows[0]) {
        await users.updatePrefs<UserPrefs>({
          userId: questionOrAnswer.authorId,
          prefs: {
            reputation:
              // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
              response.rows[0].voteStatus === "upvoted"
                ? Number(authorPrefs.reputation) - 1
                : Number(authorPrefs.reputation) + 1,
          },
        });
      } else {
        await users.updatePrefs<UserPrefs>({
          userId: questionOrAnswer.authorId,
          prefs: {
            reputation:
              // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
              voteStatus === "upvoted"
                ? Number(authorPrefs.reputation) + 1
                : Number(authorPrefs.reputation) - 1,
          },
        });
      }

      const [upvotes, downvotes] = await Promise.all([
        databases.listRows({
          databaseId: db,
          tableId: voteCollection,
          queries: [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "upvoted"),
            Query.equal("votedById", votedById),
            Query.limit(1), // for optimization as we only need total
          ],
        }),
        databases.listRows({
          databaseId: db,
          tableId: voteCollection,
          queries: [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "downvoted"),
            Query.equal("votedById", votedById),
            Query.limit(1), // for optimization as we only need total
          ],
        }),
      ]);

      return NextResponse.json(
        {
          data: { document: doc, voteResult: upvotes.total - downvotes.total },
          message: response.rows[0] ? "Vote Status Updated" : "Voted",
        },
        {
          status: 201,
        }
      );
    }

    const [upvotes, downvotes] = await Promise.all([
      databases.listRows({
          databaseId: db,
          tableId: voteCollection,
          queries: [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "upvoted"),
            Query.equal("votedById", votedById),
            Query.limit(1), // for optimization as we only need total
          ],
        }),
      databases.listRows({
          databaseId: db,
          tableId: voteCollection,
          queries: [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "downvoted"),
            Query.equal("votedById", votedById),
            Query.limit(1), // for optimization as we only need total
          ],
        }),
    ]);

    return NextResponse.json(
      {
        data: {
          document: null,
          voteResult: upvotes.total - downvotes.total,
        },
        message: "Vote Withdrawn",
      },
      {
        status: 200,
      }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error deleting answer" },
      { status: error?.status || error?.code || 500 }
    );
  }
}
