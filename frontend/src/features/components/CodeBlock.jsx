import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");
  const language = className?.replace("language-", "") || "javascript";
  const isInline = !className;

  if (isInline) {
    return (
      <code className="rounded px-1.5 py-0.5 bg-[#2a2823] text-[13.5px] font-mono text-[#e8e6e1]">
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 w-full overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-xs text-[#858178]">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[#858178] transition hover:text-white"
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
        </button>
      </div>

      {/* Code */}
      <div className="code-scroll overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "0 16px 16px 16px",
            background: "transparent",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;