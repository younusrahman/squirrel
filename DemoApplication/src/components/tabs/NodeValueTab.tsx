import React from "react";
import { userStore } from "../../stores";
import { colors } from "../../constants/colors";
import RenderTracker from "../ui/RenderTracker";
import Val from "../ui/Val";
import Btn from "../ui/Btn";
import Buttons from "../ui/Buttons";
import Section from "../ui/Section";
import InfoBox from "../ui/InfoBox";
import CodeBlock from "../ui/CodeBlock";

const rand = () => Math.floor(Math.random() * 100);

const NodeValueTab = () => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
  >
    {/* nodeValue.property */}
    <Section title="nodeValue.property" icon="1️⃣" color={colors.accent}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Access individual properties. Each is independently reactive.
      </p>

      <RenderTracker label="firstName" compact>
        <Val>{userStore.nodeValue.firstName}</Val>
      </RenderTracker>

      <RenderTracker label="lastName" compact>
        <Val>{userStore.nodeValue.lastName}</Val>
      </RenderTracker>

      <RenderTracker label="age" compact>
        <Val>{userStore.nodeValue.age}</Val>
      </RenderTracker>

      <Buttons>
        <Btn onClick={() => userStore.set({ firstName: `User_${rand()}` })}>
          Change firstName
        </Btn>
        <Btn
          onClick={() => userStore.set({ lastName: `Last_${rand()}` })}
          color={colors.info}
        >
          Change lastName
        </Btn>
        <Btn
          onClick={() =>
            userStore.set({ age: userStore.rawValue.static.age + 1 })
          }
          color={colors.success}
        >
          +1 age
        </Btn>
      </Buttons>

      <InfoBox>
        ✅ Click "Change firstName" → Only firstName flashes!
        <br />✅ Each property = separate subscription
      </InfoBox>

      <CodeBlock>
        {`// Usage
{userStore.nodeValue.firstName}
{userStore.nodeValue.lastName}
{userStore.nodeValue.age}

// Returns React element that auto-updates`}
      </CodeBlock>
    </Section>

    {/* nodeValue(fn) */}
    <Section title="nodeValue((s) => ...)" icon="2️⃣" color={colors.info}>
      <p
        style={{
          color: colors.textMuted,
          fontSize: "11px",
          margin: "0 0 8px",
        }}
      >
        Transform data. Auto-tracks which properties you access.
      </p>

      <RenderTracker label="Full Name (firstName + lastName)" compact>
        {userStore.nodeValue((s) => (
          <Val>
            {s.firstName} {s.lastName}
          </Val>
        ))}
      </RenderTracker>

      <RenderTracker label="Age Status" compact>
        {userStore.nodeValue((s) => (
          <Val>
            {s.age >= 18 ? "✅ Adult" : "👶 Minor"} ({s.age})
          </Val>
        ))}
      </RenderTracker>

      <RenderTracker label="email (separate)" compact>
        <Val>{userStore.nodeValue.email}</Val>
      </RenderTracker>

      <Buttons>
        <Btn onClick={() => userStore.set({ firstName: `First_${rand()}` })}>
          Change firstName
        </Btn>
        <Btn
          onClick={() => userStore.set({ email: `test${rand()}@mail.com` })}
          color={colors.warning}
        >
          Change email
        </Btn>
      </Buttons>

      <InfoBox>
        ✅ "Full Name" re-renders when firstName OR lastName changes
        <br />✅ email changes don't affect Full Name!
      </InfoBox>

      <CodeBlock>
        {`// Transform & combine
{userStore.nodeValue((s) => (
  <span>{s.firstName} {s.lastName}</span>
))}

// Auto-tracks: firstName, lastName
// Ignores: email, age (not accessed)`}
      </CodeBlock>
    </Section>
  </div>
);

export default NodeValueTab;