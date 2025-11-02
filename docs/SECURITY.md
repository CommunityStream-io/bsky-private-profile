# Security Considerations

## Credentials Storage

Pinata API keys are stored encrypted in PDS to protect sensitive gateway configuration data.

## Token Management

Time-limited tokens are used for private gateway access, with a default expiration of 1 hour.

## Access Control

Follower validation is performed before content access to ensure only approved followers can view private profile content.

## HTTPS Required

Production deployment requires HTTPS to protect data in transit and prevent man-in-the-middle attacks.

## Rate Limiting

Rate limiting should be implemented in production to prevent abuse and protect service availability.

## Security Disclosures

If you discover any security issues, please send an email to the project maintainers. Security vulnerabilities should be reported responsibly rather than disclosed publicly.
