import { CreateSquirrelStore } from "squirrel/src/store";

interface SocialState {
  likes: number;
  isLive: boolean;
}

export const socialStore = CreateSquirrelStore<SocialState>({
  likes: 0,
  isLive: false,
});

export function SocialFeed() {
  const { get } = socialStore();
  return (
    <div style={{ border: "1px solid green", padding: "10px" }}>
      <h3>Feed Likes: {get().Ui.likes}</h3>
      {/* 'live' is inferred as boolean from SocialState */}
      <p>
        Status: {get("isLive", (live) => (live ? "🔴 LIVE" : "⚪ Offline"))}
      </p>
    </div>
  );
}
