import { useState } from "react";

import { LuCheck, LuCopy } from "react-icons/lu";

interface CopyTextProps {
  text: string;
}

export default function CopyText({ text }: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className={`flex items-center gap-2`}>
      <div className="join w-full">
        <div className="input join-item w-full font-mono">
          <input type="text" value={text} readOnly onClick={(e) => e.currentTarget.select()} />
        </div>
        <button
          onClick={handleCopy}
          className="btn btn-outline join-item"
          aria-label="Copy to clipboard"
        >
          {copied ? <LuCheck className="h-4 w-4" /> : <LuCopy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
