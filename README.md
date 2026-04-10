<div align="center">
  <img src="/squirrel/assets/images/Squrrel-State-management.png" alt="Squirrel" width="450" />
  <p>
    <a href="https://younusrahman.github.io/squirrel/" style="font-weight: bold; font-size: 20px;">
      Squirrel Demo
    </a>
  </p>
</div>

# Squirrel

Tiny React store system with:

- **`nodeValue`** for fine-grained reactive UI updates
- **`rawValue.static`** for non-reactive snapshots
- **`rawValue.reactive`** for reactive parent re-renders
- **`CombineSquirrelStore`** for combining multiple stores

---

## Overview

Squirrel gives you 2 ways to read store data:

### 1. `nodeValue`

Use this when you want UI updates **without forcing the parent component to re-render**.

### 2. `rawValue`

Use this when you want direct state access.

- `rawValue.static` = snapshot only, **non-reactive**
- `rawValue.reactive` = reactive snapshot, **re-renders parent**

---

# Installation / Import

```ts
import { CreateSquirrelStore, CombineSquirrelStore } from "squirrel";
```

# Create a Single Store

```ts
const users = CreateSquirrelStore({
  count: 0,
  name: "Alice",
  loggedIn: false,
});
```

Now **`users`** is a store object.

# Single Store API

A single store has:

```ts
users.nodeValue
users.rawValue.static
users.rawValue.reactive
users.set(...)
users.setAsync(...)
```

# nodeValue

`nodeValue` is for reactive UI rendering.

It updates only the leaf output and avoids re-rendering the whole parent component.

## Example

```ts
function Counter() {
  return (
    <div>
      <p>Count: {users.nodeValue.count}</p>
      <button onClick={() => users.set(prev => ({ count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  );
}
```

When `count` changes, the text updates.

## Important

The parent component does not need to re-render for nodeValue updates

# nodeValue with a transform function

You can also pass a function:

```tsx
function Counter() {
  return (
    <div>
      {users.nodeValue((state) => (
        <p>
          Count is {state.count} and name is {state.name}
        </p>
      ))}
    </div>
  );
}
```

This lets you render computed UI from the store.

## Conditional example

```tsx
function Counter() {
  return users.nodeValue((state) => {
    if (state.count > 5) {
      return <h1>Limit reached</h1>;
    }
    return <p>Count: {state.count}</p>;
  });
}
```

This is reactive and safe

# rawValue.static

`rawValue.static` is a plain snapshot of current store state.

- does not subscribe
- does not re-render the parent when the store changes

## Example

```tsx
function Counter() {
  const count = users.rawValue.static.count;
  return <p>Snapshot count: {count}</p>;
}
```

If `count` changes later, this component will not re-render just because of `rawValue.static`.

Use `rawValue.static` when you only want the current state without subscribing.

## Example outside React

```tsx
console.log(users.rawValue.static.count);
```

# rawValue.reactive

`rawValue.reactive` is reactive.

It subscribes to the store and re-renders the parent component when the store updates.

## Example

```tsx
function Counter() {
  const count = users.rawValue.reactive.count;
  return <p>Reactive count: {count}</p>;
}
```

When `count` changes, the parent component re-renders.

# Important rule for rawValue.reactive

`rawValue.reactive` uses a React hook internally.

That means it must follow normal React hook rules.

## Good

```tsx
function Counter() {
  const count = users.rawValue.reactive.count;
  const [x, setX] = useState(0);

  if (count > 5) {
    return <h1>Limit reached</h1>;
  }
  return <p>{count}</p>;
}
```

## Bad

```tsx
function Counter() {
  if (users.rawValue.reactive.count > 5) {
    return <h1>Limit reached</h1>;
  }
  const [x, setX] = useState(0);
  return <p>Hello</p>;
}
```

## Why is this bad?

Because when `count` becomes greater than 5, the component returns early and React sees fewer hooks than before.

## That causes:

```tsx
Rendered fewer hooks than expected
```

## Rule

Always call `rawValue.reactive` at the top level of your component before early returns.

## set

`set` updates state immediately.

## Example

```ts
users.set({ count: 10 });
```

## Functional update

```ts
users.set((prev) => ({ count: prev.count + 1 }));
```

## Example in component

```ts
function Counter() {
  return (
    <button onClick={() => users.set(prev => ({ count: prev.count + 1 }))}>
      Increment
    </button>
  );
}
```

# setAsync

`setAsync` batches notifications into a microtask.

## Example

```ts
users.setAsync({ count: 10 });
```

## Functional update

```ts
users.setAsync((prev) => ({ count: prev.count + 1 }));
```

Use `setAsync` when you want to queue updates and notify after the current microtask.

# Basic Single Store Examples

## Example 1: Simple counter

```ts
import { CreateSquirrelStore } from "squirrel";

const users = CreateSquirrelStore({ count: 0 });

export function Counter() {
  return (
    <div>
      <p>Count: {users.nodeValue.count}</p>
      <button onClick={() => users.set(prev => ({ count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  );
}
```

## Example 2: Reactive parent render

```ts
import { CreateSquirrelStore } from "squirrel";

const users = CreateSquirrelStore({ count: 0 });

export function Counter() {
  const count = users.rawValue.reactive.count;

  if (count > 5) {
    return <h1>Limit reached</h1>;
  }

  return (
    <div>
      <p>Count: {users.nodeValue.count}</p>
      <button onClick={() => users.set(prev => ({ count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  );
}
```

## Example 3: Static snapshot

```ts
import { CreateSquirrelStore } from "squirrel";

const users = CreateSquirrelStore({ count: 0 });

export function Counter() {
  const count = users.rawValue.static.count;

  return (
    <div>
      <p>Static snapshot: {count}</p>
      <p>Reactive leaf: {users.nodeValue.count}</p>
    </div>
  );
}
```

# When to use `nodeValue` vs `rawValue`

## Use `nodeValue` when:

- you want the UI to update without re-rendering the parent
- you want fine-grained UI updates
- you want JSX output directly from store values

## Use `rawValue.static` when:

- you only want a current snapshot
- you do not want subscription
- you are outside React or reading current state once

## Use `rawValue.reactive` when:

- you want the parent component to re-render
- you need conditional rendering based on store state
- you need top-level render logic based on store state

# Combined Stores

You can `combine` multiple stores into one.

## Example stores

```ts
const storeA = CreateSquirrelStore({ count: 0 });
const storeB = CreateSquirrelStore({ count: 10 });
const storeC = CreateSquirrelStore({ count: 20 });

const allCounters = CombineSquirrelStore({
  A: storeA,
  B: storeB,
  C: storeC,
});
```

Now `allCounters` gives access to all sub-stores.

# Combined Store API

- allCounters.nodeValue
- allCounters.rawValue.static
- allCounters.rawValue.reactive
- allCounters.set(...)
- allCounters.setAsync(...)

# Combined Store Examples

## Example 1: Read combined static state

```ts
const allCounters = CombineSquirrelStore({
  A: storeA,
  B: storeB,
});

console.log(allCounters.rawValue.static.A.count);
console.log(allCounters.rawValue.static.B.count);
```

## Example 2: Reactive combined state

```ts
function Dashboard() {
  const state = allCounters.rawValue.reactive;
  return (
    <div>
      <p>A: {state.A.count}</p>
      <p>B: {state.B.count}</p>
    </div>
  );
}
```

## Example 3: nodeValue on combined store

```ts
function Dashboard() {
  return (
    <div>
      <p>A: {allCounters.nodeValue.A.count}</p>
      <p>B: {allCounters.nodeValue.B.count}</p>
    </div>
  );
}
```

## Example 4: Transform on combined store

```ts
function Dashboard() {
  return allCounters.nodeValue(state => (
    <div>
      <p>Total: {state.A.count + state.B.count + state.C.count}</p>
    </div>
  ));
}
```

# Combined Store set

You can patch multiple sub-stores at once:

```ts
allCounters.set({
  A: { count: 5 },
  B: { count: 10 },
});
```

## Example

```ts
allCounters.set({
  A: { count: 1 },
  C: { count: 99 },
});
```

## Async version

```ts
allCounters.setAsync({
  A: { count: 2 },
  B: { count: 3 },
});
```

# Lazy vs Eager Combined Store

`CombineSquirrelStore` supports two forms:

- Eager object
- Lazy callback

## 1. Eager object form

```ts
const allCounters = CombineSquirrelStore({
  A: storeA,
  B: storeB,
  C: storeC,
});
```

This reads the stores immediately.

## Use this when:

- there are no circular import problems
- you want simple direct setup

## 2. Lazy callback form

```ts
const allCounters = CombineSquirrelStore(() => ({
  A: storeA,
  B: storeB,
  C: storeC,
}));
```

This delays reading the stores until later.

## Use this when:

- you have circular imports
- a store is not safe to read during module initialization
- eager object form causes:

```txt
Cannot access 'storeX' before initialization
```

# Very important difference

## This is lazy

```ts
CombineSquirrelStore(() => ({
  A: storeA,
  B: storeB,
}));
```

## This is NOT lazy

```ts
CombineSquirrelStore({
  A: storeA,
  B: storeB,
});
```

## Why?

Because:

```ts
({ ... })
```

is just an object wrapped in parentheses.

But:

```ts
() => ({ ... })
```

is a function that returns the object later.

Only the second one delays access.

# Circular Import Explanation

Suppose:

- ComponentA.tsx exports storeA
- sharedLogic.ts imports storeA and creates allCounters
- ComponentA.tsx also imports sharedLogic.ts
  This creates a circular dependency.

In that case, eager object form may crash:

```ts
const allCounters = CombineSquirrelStore({
  A: storeA,
});
```

because storeA is read too early.

Lazy callback form usually fixes it:

```ts
const allCounters = CombineSquirrelStore(() => ({
  A: storeA,
}));
```

because `storeA` is read later, after modules finish initialization.

# Recommended Project Structure

Best practice is to keep stores in separate files instead of component files.

## Example structure

```txt
stores/storeA.ts
stores/storeB.ts
stores/storeC.ts
shared/allCounters.ts
components/ComponentA.tsx
components/ComponentB.tsx
```

## Example

stores/storeA.ts

```ts
import { CreateSquirrelStore } from "squirrel";
export const storeA = CreateSquirrelStore({ count: 0 });
```

components/ComponentA.tsx

```ts
import { storeA } from "../stores/storeA";

export function ComponentA() {
  return <div>{storeA.nodeValue.count}</div>;
}
```

shared/allCounters.ts

```ts
import { CombineSquirrelStore } from "squirrel";
import { storeA } from "../stores/storeA";
import { storeB } from "../stores/storeB";

export const allCounters = CombineSquirrelStore(() => ({
  A: storeA,
  B: storeB,
}));
```

This helps reduce circular import problems.

# Advanced Example: User List

```ts
const users = CreateSquirrelStore({
  userList: [
    { id: 1, name: "Alice", workTime: "9am - 5pm" },
    { id: 2, name: "Bob", workTime: "10am - 6pm" },
    { id: 3, name: "Charlie", workTime: "8am - 4pm" },
  ],
});
```

Render using `nodeValue`

```ts
function UserList() {
  return (
    <div>
      {users.nodeValue(state =>
        state.userList.map(user => (
          <div key={user.id}>
            <p>{user.name}</p>
            <p>{user.workTime}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

## Update list

```ts
users.set((prev) => ({
  userList: [
    ...prev.userList,
    { id: 4, name: "David", workTime: "11am - 7pm" },
  ],
}));
```

# Advanced Example: Conditional Parent Render

```ts
import { useState } from "react";

const users = CreateSquirrelStore({ count: 0 });

function UserWorkList() {
  const count = users.rawValue.reactive.count;
  const [test, setTest] = useState(0);

  if (count > 5) {
    return <h1>LIMIT REACHED!</h1>;
  }

  return (
    <div>
      <p>Current Count: {users.nodeValue.count}</p>

      <button onClick={() => users.set(prev => ({ count: prev.count + 1 }))}>
        Increment Count
      </button>

      <button onClick={() => setTest(test + 1)}>
        Increment Local State
      </button>
    </div>
  );
}
```

This works because rawValue.reactive is called before the early return.

# Advanced Example: Static Logging

```ts
const users = CreateSquirrelStore({ count: 0 });

function DebugPanel() {
  return (
    <button onClick={() => console.log(users.rawValue.static.count)}>
      Log current count
    </button>
  );
}
```

This reads the current store snapshot without subscribing.

# How Reactivity Works

## `nodeValue`

- tracks used keys
- renders only the reactive leaf
- parent component does not need to re-render

## `rawValue.static`

- plain snapshot
- no subscription
- no automatic re-render

## `rawValue.reactive`

- subscribes using React external store subscription
- parent component re-renders when store updates

# Key Points

- nodeValue is for fine-grained UI updates
- rawValue.static is for snapshots
- rawValue.reactive is for parent re-renders
- rawValue.reactive must follow hook rules
- CombineSquirrelStore object form is eager
- CombineSquirrelStore callback form is lazy
- Use lazy callback form when circular imports exist

# Common Mistakes

## Mistake 1: Using rawValue.static and expecting re-render

Wrong

```ts
const count = users.rawValue.static.count;
```

Why wrong? Because `static` does not subscribe.
Use:

```ts
const count = users.rawValue.reactive.count;
```

if you want parent re-render

## Mistake 2: Using rawValue.reactive after early return

Wrong

```ts
function Comp() {
  if (something) return null;
  const count = users.rawValue.reactive.count;
}
```

Also wrong

```ts
function Comp() {
  if (users.rawValue.reactive.count > 5) {
    return <h1>Done</h1>;
  }
  const [x, setX] = useState(0);
}
```

Why wrong? Hook order changes.

Correct

```ts
function Comp() {
  const count = users.rawValue.reactive.count;
  const [x, setX] = useState(0);

  if (count > 5) return <h1>Done</h1>;
}
```

## Mistake 3: Thinking ({ ... }) is lazy

Wrong assumption

```ts
CombineSquirrelStore({
  A: storeA,
});
```

This is still eager.

Correct lazy form

```ts
CombineSquirrelStore(() => ({
  A: storeA,
}));
```

## Mistake 4: Creating circular imports with eager combined object

If this crashes:

```txt
Cannot access 'storeA' before initialization
```

use lazy callback form:

```ts
CombineSquirrelStore(() => ({
  A: storeA,
}));
```

# FAQ

## Q: Why does nodeValue update without parent re-render?

A: Because it renders a reactive leaf component internally and subscribes only to touched keys.

## Q: Why does rawValue.static not update my component?

A: Because it is only a snapshot and does not subscribe.

## Q: Why does rawValue.reactive behave like a hook?

A: Because internally it uses React external store subscription.

## Q: Can I use rawValue.reactive conditionally?

A: No. Treat it like a hook. Call it at the top of the component.

## Q: Why does CombineSquirrelStore eager object sometimes crash?

A: Because it reads imported stores immediately and can expose circular import timing problems.

## Q: Why does lazy callback fix it?

A: Because it delays reading the stores until later.

# Full Example

```tsx
import { CreateSquirrelStore, CombineSquirrelStore } from "squirrel";
import { useState } from "react";

export const storeA = CreateSquirrelStore({ count: 0 });
export const storeB = CreateSquirrelStore({ count: 10 });

export const allCounters = CombineSquirrelStore(() => ({
  A: storeA,
  B: storeB,
}));

export function Example() {
  const a = storeA.rawValue.reactive.count;
  const combined = allCounters.rawValue.reactive;
  const [local, setLocal] = useState(0);

  if (a > 5) {
    return <h1>Store A limit reached</h1>;
  }

  return (
    <div>
      <p>Store A nodeValue: {storeA.nodeValue.count}</p>
      <p>Store B nodeValue: {storeB.nodeValue.count}</p>

      <p>Combined A: {combined.A.count}</p>
      <p>Combined B: {combined.B.count}</p>

      <button onClick={() => storeA.set((prev) => ({ count: prev.count + 1 }))}>
        Increment A
      </button>

      <button onClick={() => storeB.set((prev) => ({ count: prev.count + 1 }))}>
        Increment B
      </button>

      <button
        onClick={() =>
          allCounters.set({
            A: { count: 100 },
            B: { count: 200 },
          })
        }
      >
        Set Both
      </button>

      <button onClick={() => setLocal(local + 1)}>Local State</button>
    </div>
  );
}
```

# Summary

## Single store

- CreateSquirrelStore(...)
- direct object API
- users.nodeValue
- users.rawValue.static
- users.rawValue.reactive
- users.set(...)
- users.setAsync(...)

## Combined store

- CombineSquirrelStore({...}) for eager
- CombineSquirrelStore(() => ({...})) for lazy
- allCounters.nodeValue
- allCounters.rawValue.static
- allCounters.rawValue.reactive
- allCounters.set(...)
- allCounters.setAsync(...)

## Use

- nodeValue for reactive leaf rendering
- rawValue.static for snapshots
- rawValue.reactive for parent re-rendering
- lazy combined callback when circular imports exist
