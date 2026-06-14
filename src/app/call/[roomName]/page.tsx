"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SupportRoomInterface from "@/components/SupportRoomInterface";

export default function CallPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params.roomName as string;

  const role = (
    searchParams.get("role") ?? "CUSTOMER"
  ).toUpperCase() as "AGENT" | "CUSTOMER";

  const identity =
    searchParams.get("identity") ??
    searchParams.get("name") ??
    role;

  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName) return;

    const fetchToken = async () => {
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            identity,
            role,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to fetch token");
        }

        setToken(data.token);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    };

    fetchToken();
  }, [roomName, identity, role]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-400">
        Connecting to room{" "}
        <strong className="ml-1 text-white">{roomName}</strong>...
      </div>
    );
  } 

  return (
   <LiveKitRoom
  token={token}
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
  connect={true}
  options={{
    adaptiveStream: true,
    dynacast: true,
  }}
  style={{ height: "100dvh" }}
>
  <RoomAudioRenderer />
  <SupportRoomInterface role={role} roomName={roomName} />
</LiveKitRoom>
  );





// return (
//   token ? (
//     <LiveKitRoom
//       token={token}
//       serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
//       connect={!!token}
//       options={{
//         adaptiveStream: true,
//         dynacast: true,
//       }}
//       style={{ height: "100dvh" }}
//     >
//       <RoomAudioRenderer />
//       <SupportRoomInterface role={role} roomName={roomName} />
//     </LiveKitRoom>
//   ) : null
// );

}