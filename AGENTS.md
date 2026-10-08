# Architecture rules

- Social ON and PRISM load creator identity and calibration server-side using the authenticated caller ID and share creatorScriptRules; this prevents cross-user personalization and conflicting script limits.
- All vertical script generators use shared retention planning before drafting within the same generation, adding planning metadata without replacing existing result fields; this preserves the UI contract and avoids a second billed request.
- Store creator voice and measured content calibration in social_profile.creator_profile, keeping absent values null; this preserves existing profiles without fabricated performance data.