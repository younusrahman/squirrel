import { type ReactNode } from "react";
import { processOutput } from "../src/utils";

describe("processOutput", () => {
  it("returns null as-is", () => {
    expect(processOutput(null)).toBeNull();
  });

  it("returns undefined as-is", () => {
    expect(processOutput(undefined)).toBeUndefined();
  });

  it("returns a string as-is", () => {
    expect(processOutput("hello")).toBe("hello");
  });

  it("returns a number as-is", () => {
    expect(processOutput(42)).toBe(42);
  });

  it("returns false as-is", () => {
    expect(processOutput(false)).toBe(false);
  });

  it("returns true as-is", () => {
    expect(processOutput(true)).toBe(true);
  });

  it("returns a single React element as-is", () => {
    const el = <div>test</div>;
    expect(processOutput(el)).toBe(el);
  });

  it("assigns keys to keyless elements in array", () => {
    const nodes: ReactNode[] = [<span>a</span>, <span>b</span>];
    const result = processOutput(nodes) as React.ReactElement[];

    expect(result).toHaveLength(2);
    expect(result[0].key).toContain("sq-0");
    expect(result[1].key).toContain("sq-1");
  });

  it("preserves existing keys on elements", () => {
    const nodes: ReactNode[] = [<span key="mine">a</span>, <span>b</span>];
    const result = processOutput(nodes) as React.ReactElement[];

    expect(result[0].key).toContain("mine");
    expect(result[1].key).toContain("sq-1");
  });

  it("keyless elements get sq-N key applied", () => {
    const nodes: ReactNode[] = [<span>a</span>, <span>b</span>];
    const result = processOutput(nodes) as React.ReactElement[];

    expect(result[0].key).toMatch(/sq-0/);
    expect(result[1].key).toMatch(/sq-1/);
  });

  it("existing key elements are NOT cloned with new key", () => {
    const nodes: ReactNode[] = [<span key="existing">a</span>, <span>b</span>];
    const result = processOutput(nodes) as React.ReactElement[];

    expect(result[0].key).toMatch(/existing/);
    expect(result[1].key).toMatch(/sq-1/);
  });

  it("leaves non-element children untouched in array", () => {
    const nodes: ReactNode[] = ["hello", 99, <span>x</span>];
    const result = processOutput(nodes) as ReactNode[];

    expect(result[0]).toBe("hello");
    expect(result[1]).toBe(99);
    expect((result[2] as React.ReactElement).key).toMatch(/sq-2/);
  });

  it("handles empty array", () => {
    const result = processOutput([]);
    expect(
      result == null || (Array.isArray(result) && result.length === 0),
    ).toBe(true);
  });

  it("handles array with null/undefined/boolean children", () => {
    const nodes: ReactNode[] = [null, undefined, false, true];
    const result = processOutput(nodes);
    expect(result).toBeDefined();
  });

  it("does not modify nested element keys", () => {
    const nodes: ReactNode[] = [
      <div>
        <span>nested</span>
      </div>,
    ];
    const result = processOutput(nodes) as React.ReactElement[];
    expect(result[0].key).toMatch(/sq-0/);
    expect(
      (result[0].props as { children: React.ReactElement }).children.key,
    ).toBeNull();
  });

  it("handles single-element array", () => {
    const nodes: ReactNode[] = [<div>only</div>];
    const result = processOutput(nodes) as React.ReactElement[];
    expect(result).toHaveLength(1);
    expect(result[0].key).toMatch(/sq-0/);
  });

  it("handles array with all keyed elements", () => {
    const nodes: ReactNode[] = [<span key="a">1</span>, <span key="b">2</span>];
    const result = processOutput(nodes) as React.ReactElement[];
    expect(result[0].key).toMatch(/a/);
    expect(result[1].key).toMatch(/b/);
  });
});
