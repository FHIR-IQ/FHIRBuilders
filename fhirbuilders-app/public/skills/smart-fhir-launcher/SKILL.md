---
name: smart-fhir-launcher
description: Initiate SMART on FHIR authorization flows and manage access tokens for multiple FHIR endpoints from your agent — no manual browser auth required
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"🔐","tags":["fhir","smart-on-fhir","auth","oauth2","r4"],"requires":{"env":["SMART_CLIENT_ID","SMART_CLIENT_SECRET","FHIR_BASE_URL","SMART_SCOPES"]},"primaryEnv":"SMART_CLIENT_ID"}}
---

# SMART on FHIR Launcher

You manage SMART on FHIR authorization for multiple FHIR endpoints. You store credentials and tokens securely in your local memory, handle token refresh automatically, and surface a ready-to-use access token whenever other skills need to make authenticated FHIR calls.

## Configuration

- `SMART_CLIENT_ID` — Your SMART on FHIR client ID (registered with the FHIR endpoint)
- `SMART_CLIENT_SECRET` — Your client secret (for confidential clients)
- `FHIR_BASE_URL` — Base URL of your FHIR R4 endpoint
- `SMART_SCOPES` — Space-separated SMART scopes (default: `launch/patient patient/*.read`)

## Supported flows

### 1. Client Credentials (M2M — machine-to-machine)
For backend services with no user context. Most common for agent use.

### 2. Authorization Code (User-delegated)
For apps acting on behalf of a human user. Requires a browser step.

## How to authenticate

### Client Credentials flow

1. Discover the token endpoint from the FHIR well-known configuration:
```
GET {FHIR_BASE_URL}/.well-known/smart-configuration
```
Extract `token_endpoint`.

2. Request an access token:
```
POST {token_endpoint}
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={SMART_CLIENT_ID}
&client_secret={SMART_CLIENT_SECRET}
&scope={SMART_SCOPES}
```

3. Parse the response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "patient/*.read"
}
```

4. Store the token in your memory:
Create or update a file `SMART_TOKENS.md` in your memory with:
```
## {FHIR_BASE_URL}
- access_token: [token]
- expires_at: [ISO timestamp = now + expires_in seconds]
- scope: [scope]
- flow: client_credentials
```

### Authorization Code flow

When a user needs to authorize access on behalf of themselves:

1. Discover the authorization endpoint from `.well-known/smart-configuration`
2. Construct the authorization URL:
```
{authorization_endpoint}?
  response_type=code
  &client_id={SMART_CLIENT_ID}
  &redirect_uri=http://localhost:8080/callback
  &scope={SMART_SCOPES}
  &state={random_state}
  &aud={FHIR_BASE_URL}
```
3. Present this URL to the user: "Please open this URL in your browser to authorize access: [URL]"
4. The user completes authorization and pastes back the authorization code
5. Exchange the code:
```
POST {token_endpoint}
grant_type=authorization_code
&code={code}
&redirect_uri=http://localhost:8080/callback
&client_id={SMART_CLIENT_ID}
&client_secret={SMART_CLIENT_SECRET}
```
6. Store the resulting access_token and refresh_token in SMART_TOKENS.md

## Automatic token refresh (heartbeat)

**Heartbeat: Run every 45 minutes.**

On each heartbeat:
1. Read SMART_TOKENS.md
2. For each endpoint, check if `expires_at` is within 10 minutes
3. If expiring: use the refresh_token (if available) or re-run client_credentials flow
4. Update SMART_TOKENS.md with the new token

Token refresh using refresh_token:
```
POST {token_endpoint}
grant_type=refresh_token
&refresh_token={refresh_token}
&client_id={SMART_CLIENT_ID}
&client_secret={SMART_CLIENT_SECRET}
```

Log each refresh to HEARTBEAT.md.

## Providing tokens to other skills

When another skill requests a FHIR access token for an endpoint:
1. Read SMART_TOKENS.md
2. Find the entry for the requested endpoint
3. Check if the token is still valid (`expires_at` > now)
4. If valid: return the `access_token`
5. If expired: refresh first, then return

## Managing multiple endpoints

You can manage tokens for multiple FHIR endpoints simultaneously. Store each as a separate entry in SMART_TOKENS.md, keyed by base URL.

When a user says "add a new FHIR endpoint", ask for:
- The FHIR base URL
- The client ID and secret for that endpoint
- The desired scopes
Then run the authentication flow and store the token.

## Error handling

- If `.well-known/smart-configuration` is not found: "This endpoint may not support SMART on FHIR. Try providing the token endpoint directly."
- If token request fails with 401: "Client credentials rejected. Check your SMART_CLIENT_ID and SMART_CLIENT_SECRET."
- If refresh fails: clear the stored token and re-authenticate from scratch.
- Never log token values to plaintext notes except SMART_TOKENS.md (which should be kept private).

## Examples

**Example 1 — Initial setup**

User: Authenticate with my Epic FHIR sandbox at https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4

You: [GET https://fhir.epic.com/.well-known/smart-configuration]
     [POST token_endpoint with client_credentials]
     [stores token in SMART_TOKENS.md]

Reply:
```
🔐 **SMART Authentication Successful**
Endpoint: https://fhir.epic.com/...
Scopes granted: patient/*.read launch/patient
Token expires: 2025-03-16 16:00 UTC (60 min)
Token stored in memory. Auto-refresh enabled.
```

---

**Example 2 — Token check**

User: Is my Epic token still valid?

You: [reads SMART_TOKENS.md]

Reply:
```
🔐 Epic FHIR token: ✅ Valid
Expires in: 43 minutes
Scopes: patient/*.read launch/patient
```

---

**Example 3 — Heartbeat auto-refresh**

[45-minute heartbeat]

You: [reads SMART_TOKENS.md, finds token expiring in 8 minutes]
     [refreshes token via refresh_token grant]
     [updates SMART_TOKENS.md]
     [logs to HEARTBEAT.md: "SMART token refreshed for https://fhir.epic.com"]
     [sends no message — silent refresh]
