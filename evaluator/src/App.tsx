import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ValidationPanel } from "@/components/ValidationPanel";
import { TranslationPanel } from "@/components/TranslationPanel";
import { DecodingPanel } from "@/components/DecodingPanel";
import { getCurrentProxyUrl, setProxyUrl } from "@/lib/grpcClient";

function SettingsPanel() {
  const [url, setUrl] = useState(getCurrentProxyUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProxyUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Settings</CardTitle>
        <CardDescription>
          Configure the gRPC-web proxy connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Proxy URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
              placeholder="http://localhost:8080"
            />
            <Button onClick={handleSave} variant={saved ? "secondary" : "default"}>
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The grpcwebproxy URL that forwards requests to the OASF SDK gRPC server
          </p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Quick Setup</h4>
          <div className="bg-muted p-4 rounded-md space-y-2 text-sm font-mono">
            <p className="text-muted-foreground"># 1. Start the OASF SDK server</p>
            <p>./bin/oasf-sdk</p>
            <p className="text-muted-foreground mt-2"># 2. Start grpcwebproxy</p>
            <p>grpcwebproxy \</p>
            <p className="pl-4">--backend_addr=localhost:31234 \</p>
            <p className="pl-4">--run_tls_server=false \</p>
            <p className="pl-4">--allow_all_origins \</p>
            <p className="pl-4">--server_http_debug_port=8080</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">OASF SDK Evaluator</h1>
              <Badge variant="outline">v0.0.14</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>gRPC-web Client</span>
              <Badge variant="secondary">{getCurrentProxyUrl()}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="validation" className="space-y-4">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="decoding">Decoding</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Validation Service</h2>
              <p className="text-sm text-muted-foreground">
                Validate OASF records against JSON Schema. Supports schema versions 0.3.1, 0.7.0, and 0.8.0.
              </p>
            </div>
            <ValidationPanel />
          </TabsContent>

          <TabsContent value="translation" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Translation Service</h2>
              <p className="text-sm text-muted-foreground">
                Translate between OASF records and other formats (GitHub Copilot, A2A, MCP).
              </p>
            </div>
            <TranslationPanel />
          </TabsContent>

          <TabsContent value="decoding" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Decoding Service</h2>
              <p className="text-sm text-muted-foreground">
                Decode OASF records into strongly-typed protobuf structures. Automatically detects schema version.
              </p>
            </div>
            <DecodingPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure connection settings for the gRPC-web proxy.
              </p>
            </div>
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>OASF SDK Evaluator - Testing tool for OASF gRPC services</span>
            <a
              href="https://github.com/agntcy/oasf-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
