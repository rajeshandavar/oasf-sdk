import { useState, useCallback } from "react";
import type { JsonObject } from "@bufbuild/protobuf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonEditor } from "./JsonEditor";
import { ResponseViewer } from "./ResponseViewer";
import {
  ExampleSelector,
  translationRecordFixtures,
  translationMCPFixtures,
  translationA2AFixtures,
  loadFixture,
  type FixtureOption,
} from "./ExampleSelector";
import { getTranslationClient } from "@/lib/grpcClient";

type TranslationMethod =
  | "recordToGHCopilot"
  | "recordToA2A"
  | "a2aToRecord"
  | "mcpToRecord"
  | "ghCopilotToRecord";

interface MethodConfig {
  label: string;
  description: string;
  inputLabel: string;
  fixtures: FixtureOption[];
  defaultInput: string;
}

const methodConfigs: Record<TranslationMethod, MethodConfig> = {
  recordToGHCopilot: {
    label: "Record to GH Copilot",
    description: "Convert an OASF record to GitHub Copilot MCP config",
    inputLabel: "OASF Record",
    fixtures: translationRecordFixtures,
    defaultInput: `{
  "schema_version": "0.8.0",
  "name": "example.org/test-agent",
  "version": "v1.0.0",
  "description": "A test agent",
  "modules": [
    {
      "name": "integration/mcp",
      "version": "v1.0.0",
      "data": {
        "servers": {
          "test-server": {
            "command": "node",
            "args": ["server.js"]
          }
        }
      }
    }
  ]
}`,
  },
  recordToA2A: {
    label: "Record to A2A",
    description: "Convert an OASF record to Agent-to-Agent (A2A) card format",
    inputLabel: "OASF Record",
    fixtures: translationRecordFixtures,
    defaultInput: `{
  "schema_version": "0.8.0",
  "name": "example.org/test-agent",
  "version": "v1.0.0",
  "description": "A test agent for A2A translation"
}`,
  },
  a2aToRecord: {
    label: "A2A to Record",
    description: "Convert an A2A card to OASF record format",
    inputLabel: "A2A Card",
    fixtures: translationA2AFixtures,
    defaultInput: `{
  "name": "Test Agent",
  "description": "A test agent",
  "url": "https://example.com/agent"
}`,
  },
  mcpToRecord: {
    label: "MCP to Record",
    description: "Convert an MCP Registry entry to OASF record format",
    inputLabel: "MCP Entry",
    fixtures: translationMCPFixtures,
    defaultInput: `{
  "name": "test-mcp-server",
  "description": "A test MCP server",
  "vendor": "test-vendor",
  "sourceUrl": "https://github.com/test/mcp-server",
  "command": "npx",
  "args": ["-y", "test-mcp-server"]
}`,
  },
  ghCopilotToRecord: {
    label: "GH Copilot to Record",
    description: "Convert GitHub Copilot config to OASF record (not yet implemented)",
    inputLabel: "GitHub Copilot Config",
    fixtures: [],
    defaultInput: `{
  "mcpServers": {
    "test-server": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}`,
  },
};

export function TranslationPanel() {
  const [activeMethod, setActiveMethod] = useState<TranslationMethod>("recordToGHCopilot");
  const [inputs, setInputs] = useState<Record<TranslationMethod, string>>({
    recordToGHCopilot: methodConfigs.recordToGHCopilot.defaultInput,
    recordToA2A: methodConfigs.recordToA2A.defaultInput,
    a2aToRecord: methodConfigs.a2aToRecord.defaultInput,
    mcpToRecord: methodConfigs.mcpToRecord.defaultInput,
    ghCopilotToRecord: methodConfigs.ghCopilotToRecord.defaultInput,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<object | null>(null);

  const config = methodConfigs[activeMethod];

  const handleInputChange = useCallback(
    (value: string) => {
      setInputs((prev) => ({ ...prev, [activeMethod]: value }));
    },
    [activeMethod]
  );

  const handleLoadFixture = useCallback(
    async (fixture: FixtureOption) => {
      try {
        const content = await loadFixture(fixture.file);
        setInputs((prev) => ({ ...prev, [activeMethod]: content }));
        setError(null);
        setResponse(null);
      } catch (err) {
        setError(`Failed to load fixture: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [activeMethod]
  );

  const handleTranslate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Parse JSON input
      let inputData: object;
      try {
        inputData = JSON.parse(inputs[activeMethod]);
      } catch (parseErr) {
        throw new Error(`Invalid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      // Cast to the expected type
      const jsonData = inputData as JsonObject;

      // Call the appropriate translation method
      const client = getTranslationClient();
      let result: object;

      switch (activeMethod) {
        case "recordToGHCopilot": {
          const resp = await client.recordToGHCopilot({ record: jsonData });
          result = resp.data ?? {};
          break;
        }
        case "recordToA2A": {
          const resp = await client.recordToA2A({ record: jsonData });
          result = resp.data ?? {};
          break;
        }
        case "a2aToRecord": {
          const resp = await client.a2AToRecord({ data: jsonData });
          result = resp.record ?? {};
          break;
        }
        case "mcpToRecord": {
          const resp = await client.mCPToRecord({ data: jsonData });
          result = resp.record ?? {};
          break;
        }
        case "ghCopilotToRecord": {
          const resp = await client.gHCopilotToRecord({ data: jsonData });
          result = resp.record ?? {};
          break;
        }
        default:
          throw new Error(`Unknown method: ${activeMethod}`);
      }

      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeMethod, inputs]);

  const handleMethodChange = (method: string) => {
    setActiveMethod(method as TranslationMethod);
    setError(null);
    setResponse(null);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeMethod} onValueChange={handleMethodChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recordToGHCopilot">To GH Copilot</TabsTrigger>
          <TabsTrigger value="recordToA2A">To A2A</TabsTrigger>
          <TabsTrigger value="a2aToRecord">A2A to Record</TabsTrigger>
          <TabsTrigger value="mcpToRecord">MCP to Record</TabsTrigger>
          <TabsTrigger value="ghCopilotToRecord">GH to Record</TabsTrigger>
        </TabsList>

        {Object.keys(methodConfigs).map((method) => (
          <TabsContent key={method} value={method}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>{config.inputLabel}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.fixtures.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ExampleSelector
                        options={config.fixtures}
                        onSelect={handleLoadFixture}
                        placeholder="Load example..."
                      />
                    </div>
                  )}

                  <JsonEditor
                    value={inputs[activeMethod]}
                    onChange={handleInputChange}
                    height="400px"
                  />

                  <Button onClick={handleTranslate} disabled={isLoading} className="w-full">
                    {isLoading ? "Translating..." : `Execute ${config.label}`}
                  </Button>
                </CardContent>
              </Card>

              {/* Response Panel */}
              <ResponseViewer
                response={response}
                error={error}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
