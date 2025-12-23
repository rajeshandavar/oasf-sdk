import { useState, useCallback } from "react";
import { toJson, type JsonObject } from "@bufbuild/protobuf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonEditor } from "./JsonEditor";
import {
  ExampleSelector,
  decodingFixtures,
  loadFixture,
  type FixtureOption,
} from "./ExampleSelector";
import { getDecodingClient } from "@/lib/grpcClient";
import { RecordSchema as V1Alpha0RecordSchema } from "../gen/agntcy/oasf/types/v1alpha0/record_pb.js";
import { RecordSchema as V1Alpha1RecordSchema } from "../gen/agntcy/oasf/types/v1alpha1/record_pb.js";
import { RecordSchema as V1Alpha2RecordSchema } from "../gen/agntcy/oasf/types/v1alpha2/record_pb.js";

const DEFAULT_RECORD = `{
  "schema_version": "0.8.0",
  "name": "example.org/test-agent",
  "version": "v1.0.0",
  "description": "A test agent for decoding"
}`;

export function DecodingPanel() {
  const [input, setInput] = useState(DEFAULT_RECORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<object | null>(null);
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);

  const handleLoadFixture = useCallback(async (fixture: FixtureOption) => {
    try {
      const content = await loadFixture(fixture.file);
      setInput(content);
      setError(null);
      setResponse(null);
      setDetectedVersion(null);
    } catch (err) {
      setError(`Failed to load fixture: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const handleDecode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setDetectedVersion(null);

    try {
      // Parse JSON input
      let recordObj: object;
      try {
        recordObj = JSON.parse(input);
      } catch (parseErr) {
        throw new Error(`Invalid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      // Call the decoding service
      const client = getDecodingClient();
      const decodeResponse = await client.decodeRecord({
        record: recordObj as JsonObject
      });

      // Determine which version was returned and convert to JSON
      let decodedRecord: object | null = null;
      let version: string | null = null;

      if (decodeResponse.record.case === "v1alpha0" && decodeResponse.record.value) {
        version = "v1alpha0 (0.3.1)";
        decodedRecord = toJson(V1Alpha0RecordSchema, decodeResponse.record.value) as object;
      } else if (decodeResponse.record.case === "v1alpha1" && decodeResponse.record.value) {
        version = "v1alpha1 (0.7.0)";
        decodedRecord = toJson(V1Alpha1RecordSchema, decodeResponse.record.value) as object;
      } else if (decodeResponse.record.case === "v1alpha2" && decodeResponse.record.value) {
        version = "v1alpha2 (0.8.0)";
        decodedRecord = toJson(V1Alpha2RecordSchema, decodeResponse.record.value) as object;
      }

      setDetectedVersion(version);
      setResponse(decodedRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Input Record</CardTitle>
          <CardDescription>
            Enter an OASF record to decode into a strongly-typed protobuf structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <ExampleSelector
              options={decodingFixtures}
              onSelect={handleLoadFixture}
              placeholder="Load example record..."
            />
          </div>

          <JsonEditor value={input} onChange={setInput} height="400px" />

          <Button onClick={handleDecode} disabled={isLoading} className="w-full">
            {isLoading ? "Decoding..." : "Decode Record"}
          </Button>
        </CardContent>
      </Card>

      {/* Response Panel */}
      <Card className={response ? "border-green-500" : error ? "border-destructive" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Decoded Record
            {detectedVersion && (
              <Badge variant="secondary">{detectedVersion}</Badge>
            )}
            {isLoading && <Badge variant="secondary">Loading...</Badge>}
            {error && <Badge variant="destructive">Error</Badge>}
            {response && !error && <Badge variant="success">Success</Badge>}
          </CardTitle>
          <CardDescription>
            The decoded protobuf structure with strongly-typed fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="animate-pulse">Decoding record...</div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
              {error}
            </div>
          ) : response ? (
            <JsonEditor
              value={JSON.stringify(response, null, 2)}
              onChange={() => {}}
              readOnly
              height="400px"
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Execute a request to see the decoded record
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
