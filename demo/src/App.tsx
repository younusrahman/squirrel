import { useState } from "react";
import "./App.css";
import { AdminPanel } from "./component/AdminPanel";
import { SocialFeed } from "./component/SocialFeed";
import { UserProfile } from "./component/UserProfile";
import { Header } from "./component/Header";
import { Dashboard } from "./component/ComvitneStor";

function App() {
  return (
    <>
      <Header />
      <UserProfile />
      <SocialFeed />
      <AdminPanel />
      <Dashboard/>
    </>
  );
}

export default App;
