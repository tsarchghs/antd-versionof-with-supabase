"use client";

import { useState } from "react";
import { Button } from "antd";

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export function CodeBlock({ code }: { code: string }) {
  const [icon, setIcon] = useState<React.ReactNode>(<CopyIcon />);

  const copy = async () => {
    await navigator?.clipboard?.writeText(code);
    setIcon(<CheckIcon />);
    setTimeout(() => setIcon(<CopyIcon />), 2000);
  };

  return (
    <pre className="code-block">
      <Button
        className="code-block-action"
        size="small"
        type="default"
        shape="circle"
        onClick={copy}
        icon={icon}
        aria-label="Copy code"
      >
        <span className="sr-only">Copy</span>
      </Button>
      <code>{code}</code>
    </pre>
  );
}
