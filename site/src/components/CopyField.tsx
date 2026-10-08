"use client";

import { useState } from "react";

/**
 * The memo string is a routing identifier — if a donor retypes it wrong,
 * the money lands in the sponsor's general fund instead of ours.
 * One click, zero typos.
 */
export default function CopyField({
  value,
  label,
  block = false,
}: {
  value: string;
  label?: string;
  block?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className={`copy-field${block ? " block" : ""}`}>
      {label && <div className="small muted">{label}</div>}
      <code>{value}</code>
      <button type="button" className="btn small secondary" onClick={copy}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
