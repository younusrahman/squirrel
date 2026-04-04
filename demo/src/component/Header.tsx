import { CombineSquirrelStore } from "squirrel/src/combine";
import { userinfo } from "./UserProfile";
import { socialStore } from "./SocialFeed";


export function Header() {
  const { get } = userinfo();
  return (
    <nav style={{ background: "#333", color: "#fff", padding: "10px" }}>
      <span>Squirrel App</span>
      {/* This updates surgically even if Profile is not on screen */}
      <span style={{ float: "right" }}>User: {get().Ui.name}</span>
    </nav>
  );
}
