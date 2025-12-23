import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonEditor } from "./JsonEditor";

interface ResponseViewerProps {
  response: unknown | null;
  error: string | null;
  isLoading: boolean;
  validationResult?: {
    isValid: boolean;
    errors: string[];
  } | null;
}

export function ResponseViewer({
  response,
  error,
  isLoading,
  validationResult,
}: ResponseViewerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Response
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="animate-pulse">Processing request...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Response
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validationResult) {
    return (
      <Card className={validationResult.isValid ? "border-green-500" : "border-destructive"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Validation Result
            <Badge variant={validationResult.isValid ? "success" : "destructive"}>
              {validationResult.isValid ? "Valid" : "Invalid"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationResult.isValid ? (
            <div className="bg-green-500/10 text-green-700 p-4 rounded-md">
              The record is valid according to the OASF schema.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium text-destructive">
                Validation errors ({validationResult.errors.length}):
              </div>
              <div className="bg-destructive/10 p-4 rounded-md space-y-2 max-h-[350px] overflow-auto">
                {validationResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-mono text-destructive border-b border-destructive/20 pb-2 last:border-0 last:pb-0"
                  >
                    {err}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Execute a request to see the response
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedResponse = JSON.stringify(response, null, 2);

  return (
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Response
          <Badge variant="success">Success</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <JsonEditor
          value={formattedResponse}
          onChange={() => {}}
          readOnly
          height="400px"
        />
      </CardContent>
    </Card>
  );
}
