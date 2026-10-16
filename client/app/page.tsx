"use client";

import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [inRoom, setInRoom] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name first!");
      return;
    }
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit("create_room", { room: newRoom, user: name });
    setCurrentRoom(newRoom);
    setInRoom(true);
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !roomCode.trim()) {
      alert("Please enter both your name and a room code!");
      return;
    }
    socket.emit("join_room", { room: roomCode, user: name });
    setCurrentRoom(roomCode);
    setInRoom(true);
  };

  // Updated to send the exact time when clicking Sync Play
  const handleSyncPlay = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      videoRef.current.play();
      socket.emit("play_video", { room: currentRoom, time });
    }
  };

  // Updated to send the exact time when clicking Sync Pause
  const handleSyncPause = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      videoRef.current.pause();
      socket.emit("pause_video", { room: currentRoom, time });
    }
  };

  const handleSeek = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const newTime = e.currentTarget.currentTime;
    socket.emit("seek_video", { room: currentRoom, time: newTime });
  };

  // Updated useEffect to sync the timestamp before triggering the play/pause action
  useEffect(() => {
    const syncTimeAndAction = (time: number, action: "play" | "pause") => {
      if (videoRef.current) {
        // Only jump if the difference is more than half a second to prevent stuttering
        if (time !== undefined && Math.abs(videoRef.current.currentTime - time) > 0.5) {
          videoRef.current.currentTime = time;
        }
        if (action === "play") videoRef.current.play();
        if (action === "pause") videoRef.current.pause();
      }
    };

    const onPlay = (time: number) => syncTimeAndAction(time, "play");
    const onPause = (time: number) => syncTimeAndAction(time, "pause");
    
    const onSeek = (time: number) => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - time) > 0.5) {
        videoRef.current.currentTime = time;
      }
    };

    socket.on("play_video", onPlay);
    socket.on("pause_video", onPause);
    socket.on("seek_video", onSeek);

    return () => {
      socket.off("play_video", onPlay);
      socket.off("pause_video", onPause);
      socket.off("seek_video", onSeek);
    };
  }, []);

  if (!inRoom) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white font-sans p-4">
        <div className="bg-[#1e1e24] p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-800">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">🎬 Watch Party</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ef4444] text-white"
            />
            <button onClick={handleCreateRoom} className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors">
              Create room
            </button>
            <div className="text-center text-sm text-gray-500 my-2">or join with a code</div>
            <input
              type="text"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ef4444] text-white uppercase"
            />
            <button onClick={handleJoinRoom} className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors">
              Join room
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white font-sans p-4">
      <div className="w-full max-w-5xl bg-[#1e1e24] p-6 rounded-2xl shadow-xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎬 Room Code: <span className="text-[#ef4444] tracking-wider">{currentRoom}</span>
          </h1>
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-700">
            Watching as: {name}
          </div>
        </div>
        
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 shadow-inner">
          <video 
            ref={videoRef}
            className="w-full h-full"
            controls
            src="https://www.w3schools.com/html/mov_bbb.mp4" 
            onSeeked={handleSeek} 
          />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={handleSyncPlay} className="px-8 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors">
            Sync Play
          </button>
          <button onClick={handleSyncPause} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors border border-gray-600">
            Sync Pause
          </button>
        </div>
      </div>
    </main>
  );
}