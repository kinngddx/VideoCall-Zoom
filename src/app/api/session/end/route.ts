import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import  prisma  from "@/lib/prisma";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const { roomName, identity, role } = await req.json();

    if (!roomName || !identity || role !== "AGENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await roomService.deleteRoom(roomName);

    await prisma.session.updateMany({
      where: {
        roomName,
      },
      data: {
        status: "ENDED",
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to end session" },
      { status: 500 }
    );
  }
}