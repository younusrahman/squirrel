// squirrel-jsx.tsx
import React, { useEffect, useRef } from "react";

/**
 * Automatically wraps Squirrel DOM elements in React
 */
export function SquirrelJSX({ children }: { children: any }) {
  return children;
}

/**
 * Custom JSX runtime that handles Squirrel DOM elements
 */
export function jsx(type: any, props: any, key?: string) {
  // If it's a Squirrel DOM element (HTMLElement), wrap it
  if (type instanceof HTMLElement) {
    return <SquirrelMount element={type} key={key} />;
  }

  // If props.children contains Squirrel elements, process them
  if (props?.children) {
    const processedChildren = processChildren(props.children);
    return React.createElement(
      type,
      { ...props, children: processedChildren },
      key,
    );
  }

  // Normal React element
  return React.createElement(type, props, key);
}

export function jsxs(type: any, props: any, key?: string) {
  return jsx(type, props, key);
}

function SquirrelMount({ element }: { element: HTMLElement }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !element) return;

    container.innerHTML = "";
    container.appendChild(element);

    return () => {
      if (container.contains(element)) {
        container.removeChild(element);
      }
    };
  }, [element]);

  return <span ref={ref} />;
}

function processChildren(children: any): any {
  if (Array.isArray(children)) {
    return children.map(processChild);
  }
  return processChild(children);
}

function processChild(child: any): any {
  if (child instanceof HTMLElement) {
    return <SquirrelMount element={child} />;
  }
  if (child && typeof child === "object" && !React.isValidElement(child)) {
    // Handle objects with Squirrel elements
    return child;
  }
  return child;
}
