import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { roomName, identity, role } = await req.json();

    if (!roomName || !identity || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["AGENT", "CUSTOMER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    let session = await prisma.session.findUnique({
      where: { roomName },
    });

    if (role === "AGENT") {
      if (!session) {
        session = await prisma.session.create({
          data: {
            roomName,
            status: "ACTIVE",
            startedAt: new Date(),
            agentIdentity: identity,
          },
        });
      } else if (session.agentIdentity !== identity) {
        await prisma.session.update({
          where: { roomName },
          data: {
            agentIdentity: identity,
          },
        });
      }
    } else {
      if (!session) {
        return NextResponse.json(
          { error: "Session does not exist. Agent must join first." },
          { status: 403 }
        );
      }

      if (!session.customerIdentity) {
        await prisma.session.update({
          where: { roomName },
          data: {
            customerIdentity: identity,
          },
        });
      }
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity,
        name: identity,
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      token: await token.toJwt(),
      roomName,
      identity,
      role,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
