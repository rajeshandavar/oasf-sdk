import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
// Import services from _pb.ts which has the new GenService format
import { ValidationService } from "../gen/agntcy/oasfsdk/validation/v1/validation_service_pb.js";
import { TranslationService } from "../gen/agntcy/oasfsdk/translation/v1/translation_service_pb.js";
import { DecodingService } from "../gen/agntcy/oasfsdk/decoding/v1/decoding_service_pb.js";

// Default proxy URL - grpcwebproxy running on port 8080
const DEFAULT_PROXY_URL = "http://localhost:8080";

// Get proxy URL from localStorage or use default
function getProxyUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("grpcProxyUrl") || DEFAULT_PROXY_URL;
  }
  return DEFAULT_PROXY_URL;
}

// Set proxy URL in localStorage
export function setProxyUrl(url: string): void {
  localStorage.setItem("grpcProxyUrl", url);
  // Reinitialize transport after changing URL
  reinitializeTransport();
}

// Get current proxy URL
export function getCurrentProxyUrl(): string {
  return getProxyUrl();
}

// Create the transport
let transport = createGrpcWebTransport({
  baseUrl: getProxyUrl(),
});

// Function to reinitialize transport when URL changes
function reinitializeTransport() {
  transport = createGrpcWebTransport({
    baseUrl: getProxyUrl(),
  });
}

// Create service clients
export function getValidationClient() {
  return createClient(ValidationService, transport);
}

export function getTranslationClient() {
  return createClient(TranslationService, transport);
}

export function getDecodingClient() {
  return createClient(DecodingService, transport);
}

// Re-export message types
export type {
  ValidateRecordRequest,
  ValidateRecordResponse,
} from "../gen/agntcy/oasfsdk/validation/v1/validation_service_pb.js";

export type {
  RecordToGHCopilotRequest,
  RecordToGHCopilotResponse,
  RecordToA2ARequest,
  RecordToA2AResponse,
  A2AToRecordRequest,
  A2AToRecordResponse,
  MCPToRecordRequest,
  MCPToRecordResponse,
  GHCopilotToRecordRequest,
  GHCopilotToRecordResponse,
} from "../gen/agntcy/oasfsdk/translation/v1/translation_service_pb.js";

export type {
  DecodeRecordRequest,
  DecodeRecordResponse,
} from "../gen/agntcy/oasfsdk/decoding/v1/decoding_service_pb.js";
