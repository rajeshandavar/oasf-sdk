import { useState, useCallback } from "react";
import type { JsonObject } from "@bufbuild/protobuf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonEditor } from "./JsonEditor";
import { ResponseViewer } from "./ResponseViewer";
import {
  ExampleSelector,
  validationFixtures,
  loadFixture,
  type FixtureOption,
} from "./ExampleSelector";
import { getValidationClient } from "@/lib/grpcClient";

const DEFAULT_RECORD = `{
  "schema_version": "0.8.0",
  "name": "example.org/test-agent",
  "version": "v1.0.0",
  "description": "A test agent for validation"
}`;

export function ValidationPanel() {
  const [input, setInput] = useState(DEFAULT_RECORD);
  const [schemaUrl, setSchemaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const handleLoadFixture = useCallback(async (fixture: FixtureOption) => {
    try {
      const content = await loadFixture(fixture.file);
      setInput(content);
      setError(null);
      setValidationResult(null);
    } catch (err) {
      setError(`Failed to load fixture: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const handleValidate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      // Parse JSON input
      let record: object;
      try {
        record = JSON.parse(input);
      } catch (parseErr) {
        throw new Error(`Invalid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      // Call the validation service (record is passed as plain JSON object)
      const client = getValidationClient();
      const response = await client.validateRecord({
        record: record as JsonObject,
        schemaUrl: schemaUrl || "",
      });

      setValidationResult({
        isValid: response.isValid,
        errors: response.errors,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [input, schemaUrl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Input Record</CardTitle>
          <CardDescription>
            Enter an OASF record to validate against the JSON schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <ExampleSelector
              options={validationFixtures}
              onSelect={handleLoadFixture}
              placeholder="Load example record..."
            />
          </div>

          <JsonEditor value={input} onChange={setInput} height="350px" />

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Schema URL (optional)
            </label>
            <input
              type="text"
              value={schemaUrl}
              onChange={(e) => setSchemaUrl(e.target.value)}
              placeholder="https://example.com/schema.json"
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the embedded schema based on the record's schema_version
            </p>
          </div>

          <Button onClick={handleValidate} disabled={isLoading} className="w-full">
            {isLoading ? "Validating..." : "Validate Record"}
          </Button>
        </CardContent>
      </Card>

      {/* Response Panel */}
      <ResponseViewer
        response={null}
        error={error}
        isLoading={isLoading}
        validationResult={validationResult}
      />
    </div>
  );
}
