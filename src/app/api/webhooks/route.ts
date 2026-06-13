import { NextRequest, NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import  prisma  from "@/lib/prisma";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const authorization = req.headers.get("authorization");

    const event = await receiver.receive(
      rawBody,
      authorization ?? ""
    );

    switch (event.event) {
  case "room_started": {
    const roomName = event.room?.name;

    if (!roomName) break;

    await prisma.session.updateMany({
      where: { roomName },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    break;
  }

  case "participant_joined": {
    const roomName = event.room?.name;
    const identity = event.participant?.identity;

    if (!roomName || !identity) break;

    const session = await prisma.session.findUnique({
      where: { roomName },
    });

    if (!session) break;

    await prisma.participantLog.create({
      data: {
        sessionId: session.id,
        identity,
        role: "UNKNOWN",
      },
    });

    break;
  }

  case "participant_left": {
    const roomName = event.room?.name;
    const identity = event.participant?.identity;

    if (!roomName || !identity) break;

    const session = await prisma.session.findUnique({
      where: { roomName },
    });

    if (!session) break;

    await prisma.participantLog.updateMany({
      where: {
        sessionId: session.id,
        identity,
      },
      data: {
        leftAt: new Date(),
      },
    });

    break;
  }

  case "egress_ended": {
    const roomName = event.room?.name;

    if (!roomName) break;

    const session = await prisma.session.findUnique({
      where: { roomName },
    });

    if (!session) break;

    await prisma.recording.create({
      data: {
        sessionId: session.id,
        egressId: event.egressInfo?.egressId ?? crypto.randomUUID(),
        status: "COMPLETED",
        filePath:
          event.egressInfo?.fileResults?.[0]?.filename ?? null,
        completedAt: new Date(),
      },
    });

    break;
  }

  default:
    break;
}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 401 }
    );
  }
}