import { userinfo } from "./UserProfile";
import { socialStore } from "./SocialFeed";

export function AdminPanel() {
  const user = userinfo();
  const social = socialStore();

  const handleUpdate = () => {
    // Autocomplete works for .name and .isLive
    user.set({ name: "Admin Active" });
    social.set({ isLive: true });
  };

  return (
    <div style={{ border: "1px solid red", padding: "10px" }}>
      <h4>Admin Controls</h4>
      {/* 'prev' is inferred as UserState. age is inferred as number */}
      <button onClick={() => user.set(prev => ({ age: prev.age + 1 }))}>+1 Age</button>
      <button onClick={handleUpdate}>Set Admin Status</button>
    </div>
  );
}