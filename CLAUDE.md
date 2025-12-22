# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The OASF SDK provides tools and services for working with OASF (Open Agent Service Format) records. OASF is a standardized schema for describing AI agents and their integration capabilities.

This repository contains:
- **gRPC Services**: Validation, Translation, and Decoding services for OASF records
- **SDK Packages**: Reusable Go packages for working with OASF data
- **Multi-Version Support**: OASF schema versions 0.3.1 (v1alpha0), 0.7.0 (v1alpha1), and 0.8.0 (v1alpha2)
- **Protocol Buffer Bindings**: Available at [buf.build/agntcy/oasf-sdk](https://buf.build/agntcy/oasf-sdk)

Current version: v0.0.14

For detailed API usage examples, see [USAGE.md](./USAGE.md).

## Architecture

### Multi-Module Structure

This is a multi-module Go project with three main modules:
- `github.com/agntcy/oasf-sdk/pkg` - Core SDK packages
- `github.com/agntcy/oasf-sdk/server` - gRPC server implementation
- `github.com/agntcy/oasf-sdk/e2e` - End-to-end tests

### Directory Layout

```
oasf-sdk/
├── pkg/              # Reusable SDK packages
│   ├── decoder/     # Decodes untyped records into strongly-typed protobuf structures
│   ├── translator/  # Translates between OASF and other formats (MCP, A2A, GitHub Copilot)
│   └── validator/   # Validates OASF records against JSON Schema
├── server/          # gRPC server implementation
│   ├── cmd/        # Server entry point (main.go)
│   ├── config/     # Configuration management
│   └── controller/ # Service controllers (validation/v1, translation/v1, decoding/v1)
├── proto/          # Protocol Buffer definitions
│   └── agntcy/oasfsdk/
│       ├── validation/v1/
│       ├── translation/v1/
│       └── decoding/v1/
├── e2e/            # End-to-end tests with test fixtures
└── helm/           # Kubernetes Helm charts for deployment
```

### Three Core Services

The gRPC server (server/server.go:66-68) registers three services:

1. **DecodingService** - Converts untyped OASF records (as protobuf Struct) into strongly-typed protobuf structures based on schema version
2. **TranslationService** - Bidirectional translation between OASF and other agent formats:
   - OASF ↔ MCP (Model Context Protocol)
   - OASF ↔ A2A (Agent-to-Agent)
   - OASF → GitHub Copilot MCP config
3. **ValidationService** - Validates OASF records against JSON Schema (supports both embedded schemas and remote schema server API)

### Key Architectural Patterns

**Schema Version Detection**: The decoder (pkg/decoder/record.go:18-50) inspects the `schema_version` field to route to the appropriate protobuf types (v1alpha0, v1alpha1, or v1alpha2).

**Multi-Version Support**: The codebase imports OASF protobuf types from buf.build for each schema version:
- `buf.build/gen/go/agntcy/oasf/protocolbuffers/go/agntcy/oasf/types/v1alpha0` (0.3.1)
- `buf.build/gen/go/agntcy/oasf/protocolbuffers/go/agntcy/oasf/types/v1alpha1` (0.7.0)
- `buf.build/gen/go/agntcy/oasf/protocolbuffers/go/agntcy/oasf/types/v1alpha2` (0.8.0)

**Controller Pattern**: Server controllers (server/controller/) wrap the pkg/ packages and handle gRPC request/response marshalling.

## Development Commands

This project uses [Taskfile](https://taskfile.dev) for task automation. List all available tasks with `task -l`.

### Essential Commands

**Building:**
```bash
# Compile binary for host platform (output: bin/oasf-sdk)
task compile

# Compile for all platforms (linux, darwin, windows on amd64/arm64)
task compile:all

# Build Docker image for host platform
task build

# Build Docker image for multiple platforms (linux/amd64, linux/arm64)
task build:all
```

**Testing:**
```bash
# Run unit tests for all modules (excludes e2e)
task test

# Run end-to-end tests (creates Kind cluster, installs Helm chart, runs tests, cleans up)
task e2e:test
```

**Code Quality:**
```bash
# Run all linters (golangci-lint + buf)
task lint

# Run golangci-lint with auto-fix
task lint:golangci-lint FIX=true

# Format protocol buffer files
task fmt
```

**License Compliance:**
```bash
# Check license headers and dependency licenses
task license
```

**Release:**
```bash
# Verify release readiness
task release:verify

# Prepare multi-module release (updates versions, creates commit)
task release:prepare
```

**Helm:**
```bash
# Lint Helm chart
task helm:lint

# Package Helm chart
task helm:package VERSION=0.0.1-dev

# Push packaged chart to OCI registry (ghcr.io)
task helm:push VERSION=0.0.1-dev
```

### Running the Server Locally

The gRPC server listens on port **31234**.

**Option 1 - Using compiled binary:**
```bash
task compile
./bin/oasf-sdk
```

**Option 2 - Using Docker:**
```bash
task build
docker run -p 31234:31234 oasf-sdk:latest
```

**Option 3 - Using published image:**
```bash
docker run -p 31234:31234 ghcr.io/agntcy/oasf-sdk:latest
```

Test with grpcurl:
```bash
grpcurl -plaintext localhost:31234 list
```

## Testing

### Unit Tests

Unit tests are located alongside the code in each package. Run with:
```bash
task test
```

This runs `go test -v ./...` in all modules except e2e.

### End-to-End Tests

E2E tests (e2e/) use:
- **Kind (Kubernetes in Docker)** - Creates a test cluster named "oasf-sdk-test"
- **Helm** - Installs the oasf-sdk chart in the cluster
- **Ginkgo/Gomega** - Test framework

Test fixtures are in `e2e/fixtures/` with valid and invalid OASF records for different schema versions.

Run E2E tests:
```bash
# Full test cycle (setup + test + teardown)
task e2e:test

# Setup only (for debugging)
task e2e:test:setup

# Teardown only
task e2e:test:tear-down
```

## Important Conventions

### Multi-Module Versioning

This project uses OpenTelemetry's `multimod` tool to manage versions across multiple Go modules. All module versions are defined in `versions.yaml`.

**When updating versions:**
1. Update the version in `versions.yaml`
2. Run `task release:verify` to check for issues
3. Run `task release:prepare` to update all go.mod files and create a signed commit

### Developer Certificate of Origin (DCO)

All commits **must** be signed off with DCO. Use `git commit -s` or:
```bash
git commit --signoff -m "Your commit message"
```

This adds a `Signed-off-by` line certifying you have the right to contribute the code.

### License Headers

All source files must include the Apache 2.0 license header:
```go
// Copyright AGNTCY Contributors (https://github.com/agntcy)
// SPDX-License-Identifier: Apache-2.0
```

Check compliance with `task license:header`.

### Code Quality Standards

- **golangci-lint**: Version 2.6.1 with extensive linters enabled (.golangci.yml)
- **Buf**: Version 1.50.1 for protobuf linting and formatting
- All linters must pass before merging

### Protocol Buffer Development

When modifying proto files:
1. Edit files in `proto/agntcy/oasfsdk/`
2. Run `task fmt` to format and update dependencies
3. Run `task lint:buf` to check for issues
4. Protobuf types from `buf.build/agntcy/oasf` are dependencies (don't modify locally)

## Release Process

See [RELEASE.md](./RELEASE.md) for detailed release procedures.

**Quick reference:**
1. Update version in `versions.yaml`
2. Run `task release:verify`
3. Run `task release:prepare` (creates signed commit)
4. Create PR with title format: "release: prepare version vX.Y.Z"
5. After merge, create and push git tag
6. GitHub Actions will build and publish artifacts

Releases are distributed via:
- **GitHub Releases** - Binaries for multiple platforms
- **GitHub Packages** - Docker images at ghcr.io/agntcy/oasf-sdk
- **OCI Registry** - Helm charts at oci://ghcr.io/agntcy/oasf-sdk/helm-charts

## Additional Resources

- **Contributing Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Usage Examples**: [USAGE.md](./USAGE.md) - Detailed examples using Go, Python, JavaScript, and grpcurl
- **Compatibility Matrix**: [COMPATIBILITY.md](./COMPATIBILITY.md) - OASF version compatibility
- **Security**: [SECURITY.md](./SECURITY.md) - Report security issues to security@agntcy.org
- **Code of Conduct**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
