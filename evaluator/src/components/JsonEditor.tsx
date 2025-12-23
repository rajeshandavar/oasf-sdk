import Editor from "@monaco-editor/react";
import { useCallback } from "react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  height = "400px",
}: JsonEditorProps) {
  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        height={height}
        language="json"
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
