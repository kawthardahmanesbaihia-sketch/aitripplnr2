import dns from "dns"

// ── Format validation ──────────────────────────────────────────────────────────

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export function validateEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

// ── MX record validation ───────────────────────────────────────────────────────

export interface EmailValidationResult {
  valid:  boolean
  reason?: string
}

export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  const parts = email.split("@")
  if (parts.length !== 2 || !parts[1]) {
    return { valid: false, reason: "Invalid email format" }
  }

  const domain = parts[1].toLowerCase()

  // Known large providers — skip DNS (always valid, avoids quota waste)
  const KNOWN_PROVIDERS = new Set([
    "gmail.com", "googlemail.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.fr",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com",
    "proton.me", "protonmail.com",
    "aol.com", "zoho.com",
  ])
  if (KNOWN_PROVIDERS.has(domain)) return { valid: true }

  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err) {
        // ENOTFOUND / ENODATA = domain does not exist or has no MX records
        if (
          err.code === "ENOTFOUND" ||
          err.code === "ENODATA"   ||
          err.code === "ESERVFAIL"
        ) {
          resolve({
            valid:  false,
            reason: `The domain "${domain}" does not exist or has no mail servers`,
          })
        } else {
          // Network error / timeout — fail open to avoid blocking legitimate users
          console.warn(`[email-validator] DNS lookup error (${err.code}) for ${domain} — allowing through`)
          resolve({ valid: true })
        }
      } else if (!addresses || addresses.length === 0) {
        resolve({
          valid:  false,
          reason: `The domain "${domain}" has no mail servers`,
        })
      } else {
        resolve({ valid: true })
      }
    })
  })
}
