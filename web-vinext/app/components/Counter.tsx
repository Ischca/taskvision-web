"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount((c) => c - 1)}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        -
      </button>
      <span className="text-2xl font-mono w-12 text-center">{count}</span>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        +
      </button>
    </div>
  );
}
