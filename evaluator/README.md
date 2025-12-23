# OASF SDK Evaluator

A React/TypeScript webapp for testing the OASF SDK gRPC server using gRPC-web.

## Features

- **Validation Service**: Validate OASF records against JSON Schema (supports 0.3.1, 0.7.0, 0.8.0)
- **Translation Service**: Translate between OASF and other formats (GitHub Copilot, A2A, MCP)
- **Decoding Service**: Decode OASF records into strongly-typed protobuf structures
- **Pre-loaded fixtures**: Example records from the e2e test suite
- **Monaco Editor**: Full-featured JSON editor with syntax highlighting

## Prerequisites

1. **OASF SDK Server** running on port 31234
2. **grpcwebproxy** for gRPC-web translation

### Install grpcwebproxy

```bash
# Using Go
go install github.com/improbable-eng/grpc-web/go/grpcwebproxy@latest
```

## Quick Start

### 1. Start the OASF SDK server

```bash
# From the project root
task compile
./bin/oasf-sdk
```

### 2. Start grpcwebproxy

```bash
grpcwebproxy \
  --backend_addr=localhost:31234 \
  --run_tls_server=false \
  --allow_all_origins \
  --server_http_debug_port=8080
```

Or from the evaluator directory:

```bash
npm run proxy
```

### 3. Start the webapp

```bash
cd evaluator
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Architecture

```
Browser (localhost:5173)
    │
    ▼ (gRPC-web over HTTP)
grpcwebproxy (localhost:8080)
    │
    ▼ (gRPC)
OASF SDK Server (localhost:31234)
```

## Development

### Regenerate proto types

If the proto definitions change, regenerate TypeScript types:

```bash
npm run generate
```

### Build for production

```bash
npm run build
```

## Tech Stack

- React 18 + TypeScript + Vite
- @connectrpc/connect-web for gRPC-web
- @bufbuild/protobuf for proto types
- Tailwind CSS + shadcn/ui for styling
- Monaco Editor for JSON editing

## Configuration

The proxy URL can be changed in the Settings tab. Default is `http://localhost:8080`.
