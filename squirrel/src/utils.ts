import { ReactNode, Children, isValidElement, cloneElement } from "react";

export function processOutput(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return Children.map(node, (child, index) => {
      if (isValidElement(child) && child.key === null) {
        return cloneElement(child, { key: `sq-${index}` } as any);
      }
      return child;
    });
  }
  return node;
}
