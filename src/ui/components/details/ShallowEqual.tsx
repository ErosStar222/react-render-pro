import * as React from "react";

export function ShallowEqual() {
  return (
    <span
      className="event-render-reason__shallow-equal"
      title="No difference in entries. In case of props or context, a value memoization might be effective. In case of state, additional checking before changing the state can be effective."
    >
      Shallow equal
    </span>
  );
}
