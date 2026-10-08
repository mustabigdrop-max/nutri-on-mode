# Architecture rules

- Social ON and PRISM load creator identity and calibration server-side using the authenticated caller ID and share creatorScriptRules; this prevents cross-user personalization and conflicting script limits.
- Store creator voice and measured content calibration in social_profile.creator_profile, keeping absent values null; this preserves existing profiles without fabricated performance data.