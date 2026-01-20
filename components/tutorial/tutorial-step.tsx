"use client";

import { Checkbox } from "antd";
import { useState } from "react";

export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <li className={`tutorial-step${checked ? " checked" : ""}`}>
      <Checkbox
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        aria-label={title}
      />
      <div>
        <div className="tutorial-step-title">{title}</div>
        <div className="tutorial-step-body">{children}</div>
      </div>
    </li>
  );
}
