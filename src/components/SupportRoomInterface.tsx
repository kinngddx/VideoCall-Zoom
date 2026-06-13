"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useTracks,
  useChat,
  useLocalParticipant,
  useRoomContext,
  VideoTrack,
  // AudioTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";

interface Props {
  role: "AGENT" | "CUSTOMER";
  roomName: string;
}

// interface ChatMessage {
//   id: string;
//   sender: string;
//   body: string;
//   timestamp: number;
//   isFile?: boolean;
// }

export default function SupportRoomInterface({ role, roomName }: Props) {
  const room = useRoomContext();

useEffect(() => {
  const enableMedia = async () => {
    if (room.state !== "connected") return;

    try {
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      console.error(err);
    }
  };

  enableMedia();
}, [room]);
  const router = useRouter();
  // const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { chatMessages, send } = useChat();

  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const tracks = useTracks(
  [
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: true },
  ],
  { onlySubscribed: false }
);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(micMuted);
    setMicMuted((m) => !m);
  }, [localParticipant, micMuted]);

  const toggleCam = useCallback(async () => {
    await localParticipant.setCameraEnabled(camOff);
    setCamOff((c) => !c);
  }, [localParticipant, camOff]);

  const toggleRecording = useCallback(async () => {
    setRecordingLoading(true);
    try {
      const endpoint = recording ? "/api/session/end" : "/api/session/record/start";
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      });
      setRecording((r) => !r);
    } finally {
      setRecordingLoading(false);
    }
  }, [recording, roomName]);

  const endCall = useCallback(async () => {
    await fetch("/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
    });
    await room.disconnect();
    router.push("/dashboard");
  }, [room, roomName, router]);

  const sendMessage = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    await send(trimmed);
    setChatInput("");
  }, [chatInput, send]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/file/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await send(`📎 [${file.name}](${data.url})`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [send]);

  // const isFileMsg = (body: string) => body.startsWith("📎 [");






  const renderMessage = (msg: ReturnType<typeof useChat>["chatMessages"][number], idx: number) => {
    const isSelf = msg.from?.identity === localParticipant.identity;
    const fileMatch = msg.message.match(/📎 \[(.+?)\]\((.+?)\)/);

    return (
      <div key={idx} className={`flex flex-col mb-3 ${isSelf ? "items-end" : "items-start"}`}>
        <span className="text-[10px] text-slate-500 mb-1 px-1">
          {msg.from?.name ?? msg.from?.identity ?? "Unknown"}
        </span>
    {fileMatch ? (
  <a
    href={fileMatch[2]}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors max-w-[220px]"
  >
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>

    <span className="truncate">{fileMatch[1]}</span>
  </a>
) : (
          <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[220px] break-words ${
            isSelf
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-slate-700/80 text-slate-200 rounded-tl-sm"
          }`}>
            {msg.message}
          </div>
        )}
        <span className="text-[9px] text-slate-600 mt-1 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    );
  };







  return (
    <div className="flex h-screen w-full bg-[#0b0d14] text-white overflow-hidden font-sans">

      {/* ── MAIN AREA ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0d0f1a]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)] animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">{roomName}</span>
            <span className="text-xs text-slate-500 font-mono">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-widest uppercase border ${
              role === "AGENT"
                ? "border-violet-500/40 text-violet-400 bg-violet-500/10"
                : "border-sky-500/40 text-sky-400 bg-sky-500/10"
            }`}>
              {role}
            </span>
          </div>
        </header>

        {/* Video Grid */}
        <div className="flex-1 overflow-hidden p-4">
          <div
            className="h-full grid gap-3"
            style={{
              gridTemplateColumns: tracks.length <= 1
                ? "1fr"
                : tracks.length === 2
                ? "repeat(2, 1fr)"
                : tracks.length <= 4
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gridAutoRows: tracks.length <= 2 ? "1fr" : "1fr",
            }}
          >
            {tracks.length === 0 && (
              <div className="flex items-center justify-center text-slate-600 text-sm">
                Waiting for participants…
              </div>
            )}
            {tracks.map((trackRef, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden bg-[#13151f] border border-white/5 group"
              >
                {trackRef.publication ? (
  trackRef.source === Track.Source.Camera ? (
    <VideoTrack
      trackRef={trackRef}
      className="w-full h-full object-cover"
    />
  ) : (
    <VideoTrack
      trackRef={trackRef}
      className="w-full h-full object-contain bg-black"
    />
  )
) : (
                 <div className="w-full h-full flex items-center justify-center">
  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl font-semibold text-slate-400">
    {(
      trackRef.participant?.name ||
      trackRef.participant?.identity ||
      "?"
    )
      .charAt(0)
      .toUpperCase()}
  </div>
</div>
                )}
                {/* Participant label */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] bg-black/60 backdrop-blur px-2 py-0.5 rounded-full text-slate-300 truncate max-w-[60%]">
                    {trackRef.participant.name ?? trackRef.participant.identity}
                    {trackRef.participant.isLocal && " (you)"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="shrink-0 flex items-center justify-center gap-3 py-4 px-6 border-t border-white/5 bg-[#0d0f1a]/60 backdrop-blur">

          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${
              micMuted
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                : "bg-slate-700/60 border-white/10 text-slate-300 hover:bg-slate-700"
            }`}
            title={micMuted ? "Unmute mic" : "Mute mic"}
          >
            {micMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCam}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${
              camOff
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                : "bg-slate-700/60 border-white/10 text-slate-300 hover:bg-slate-700"
            }`}
            title={camOff ? "Turn camera on" : "Turn camera off"}
          >
            {camOff ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            )}
          </button>

          {/* Record — AGENT only */}
          {role === "AGENT" && (
            <button
              onClick={toggleRecording}
              disabled={recordingLoading}
              className={`flex items-center gap-2 px-4 h-11 rounded-full text-xs font-semibold transition-all border ${
                recording
                  ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                  : "bg-slate-700/60 border-white/10 text-slate-300 hover:bg-slate-700"
              } disabled:opacity-40`}
              title={recording ? "Stop recording" : "Start recording"}
            >
              <span className={`w-2 h-2 rounded-full ${recording ? "bg-red-400 animate-pulse" : "bg-slate-400"}`} />
              {recordingLoading ? "…" : recording ? "Stop Rec" : "Record"}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 transition-colors border border-red-500/50 text-white"
            title="End call"
          >
            <svg className="w-5 h-5 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── CHAT SIDEBAR ── */}
      <aside className="w-[300px] shrink-0 flex flex-col border-l border-white/5 bg-[#0d0f1a]">

        {/* Sidebar Header */}
        <div className="px-4 py-3.5 border-b border-white/5 shrink-0">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400">Live Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {chatMessages.length === 0 && (
            <p className="text-xs text-slate-600 text-center mt-8">No messages yet. Say hello.</p>
          )}
          {chatMessages.map((msg, i) => renderMessage(msg, i))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-white/5 p-3 space-y-2">
          <div className="flex gap-2 items-end">
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Send a message…"
              className="flex-1 resize-none bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim()}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              title="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl border border-white/8 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-[11px] transition-all disabled:opacity-40"
              title="Share a file"
            >
              {uploading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Share file
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}