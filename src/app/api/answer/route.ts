/* eslint-disable @typescript-eslint/no-explicit-any */
import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export default async function POST(request: NextRequest) {
  try {
    const { questionId, authorId, answer } = await request.json();
    const response = await databases.createRow({
      databaseId: db, // The ID of the database
      tableId: answerCollection, // The ID of the table (your 'answerCollection')
      rowId: ID.unique(), // Generates a unique ID for the new row
      data: {
        content: answer,
        authorId: authorId,
        questionId: questionId,
      },
    });

    //Increase author reputation
    const prefs = await users.getPrefs<UserPrefs>(authorId);
    await users.updatePrefs({
      userId: authorId,
      prefs: {
        reputation: Number(prefs.reputation) + 1,
      },
    });

    return NextResponse.json(response, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    const answer = await databases.getRow({
      databaseId: db,
      tableId: answerCollection,
      rowId: answerId,
    });

    const response = await databases.deleteRow({
      databaseId: db,
      tableId: answerCollection,
      rowId: answerId,
    });

    //decrese the reputation
    const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
    await users.updatePrefs({
      userId: answer.authorId,
      prefs: {
        reputation: Number(prefs.reputation) - 1,
      },
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Error deleting the answer",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}
