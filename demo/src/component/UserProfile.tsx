import { CreateSquirrelStore } from "squirrel/src/store";
import { socialStore } from "./SocialFeed";
import { CombineSquirrelStore } from "squirrel/src/combine";

interface UserState {
  name: string;
  age: number;
}

// One-liner declaration
export const userinfo = CreateSquirrelStore<UserState>({
  name: "Superuser",
  age: 22,
});
export const masterStore = CombineSquirrelStore({
  user: userinfo,
  social: socialStore
});
export function UserProfile() {
  const { get } = userinfo();
  return (
    <div style={{ border: "1px solid blue", padding: "10px" }}>
      {/* get().Ui.name is strictly typed as a ReactNode */}
      <h2>Profile: {get().Ui.name}</h2>
      {/* get().Ui.age is strictly typed as a ReactNode */}
      <p>Age: {get().Ui.age}</p>
    </div>
  );
}
