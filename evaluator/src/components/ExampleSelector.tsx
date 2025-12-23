import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FixtureOption {
  label: string;
  value: string;
  file: string;
}

interface ExampleSelectorProps {
  options: FixtureOption[];
  onSelect: (fixture: FixtureOption) => void;
  placeholder?: string;
}

export function ExampleSelector({
  options,
  onSelect,
  placeholder = "Load example...",
}: ExampleSelectorProps) {
  const handleSelect = (value: string) => {
    const option = options.find((opt) => opt.value === value);
    if (option) {
      onSelect(option);
    }
  };

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Fixture definitions for different services
export const validationFixtures: FixtureOption[] = [
  { label: "Valid v0.8.0 Record", value: "valid_0.8.0", file: "/fixtures/valid_0.8.0_record.json" },
  { label: "Valid v0.7.0 Record", value: "valid_0.7.0", file: "/fixtures/valid_0.7.0_record.json" },
  { label: "Valid v0.3.1 Record", value: "valid_0.3.1", file: "/fixtures/valid_0.3.1_record.json" },
  { label: "Invalid v0.8.0 Record", value: "invalid_0.8.0", file: "/fixtures/invalid_0.8.0_record.json" },
  { label: "Invalid v0.7.0 Record", value: "invalid_0.7.0", file: "/fixtures/invalid_0.7.0_record.json" },
  { label: "Invalid v0.3.1 Record", value: "invalid_0.3.1", file: "/fixtures/invalid_v0.3.1_record.json" },
];

export const decodingFixtures: FixtureOption[] = [
  { label: "Valid v0.8.0 Record", value: "valid_0.8.0", file: "/fixtures/valid_0.8.0_record.json" },
  { label: "Valid v0.7.0 Record", value: "valid_0.7.0", file: "/fixtures/valid_0.7.0_record.json" },
  { label: "Valid v0.3.1 Record", value: "valid_0.3.1", file: "/fixtures/valid_0.3.1_record.json" },
];

export const translationRecordFixtures: FixtureOption[] = [
  { label: "Translation v0.8.0 Record", value: "translation_0.8.0", file: "/fixtures/translation_0.8.0_record.json" },
  { label: "Translation v0.7.0 Record", value: "translation_0.7.0", file: "/fixtures/translation_0.7.0_record.json" },
  { label: "Valid v0.8.0 Record", value: "valid_0.8.0", file: "/fixtures/valid_0.8.0_record.json" },
];

export const translationMCPFixtures: FixtureOption[] = [
  { label: "Full MCP Entry", value: "mcp_full", file: "/fixtures/translation_mcp.json" },
  { label: "Minimal MCP (Local)", value: "mcp_local", file: "/fixtures/translation_mcp_minimal_local.json" },
  { label: "Minimal MCP (SSE)", value: "mcp_sse", file: "/fixtures/translation_mcp_sse_minimal.json" },
  { label: "MCP with HTTP Headers", value: "mcp_http", file: "/fixtures/translation_mcp_http_headers.json" },
];

export const translationA2AFixtures: FixtureOption[] = [
  { label: "A2A Card", value: "a2a_card", file: "/fixtures/expected_a2a_output.json" },
];

// Helper function to load fixture content
export async function loadFixture(file: string): Promise<string> {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Failed to load fixture: ${file}`);
  }
  const text = await response.text();
  // Parse and re-stringify to ensure proper formatting
  try {
    const json = JSON.parse(text);
    return JSON.stringify(json, null, 2);
  } catch {
    return text;
  }
}
