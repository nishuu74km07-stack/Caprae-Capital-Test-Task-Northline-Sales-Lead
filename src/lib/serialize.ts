import { checkEmail } from "./emailCheck";
import type { Lead, PublicLead } from "./types";

export function toPublicLead(lead: Lead): PublicLead {
  if (!lead.enriched) {
    return {
      ...lead,
      email: null,
      directPhone: null,
      linkedin: null,
      ownerTenure: null,
      emailCheck: null,
    };
  }

  return {
    ...lead,
    emailCheck: lead.email.trim() ? checkEmail(lead.email) : {
      valid: false,
      roleAccount: false,
      note: "Enrichment did not return an email.",
    },
  };
}
