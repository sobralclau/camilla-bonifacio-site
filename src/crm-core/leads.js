import { clean, onlyDigits } from "./utils.js";

export function normalizeLeadInput(input = {}) {
  return {
    name: clean(input.name, 100),
    phone: onlyDigits(input.phone, 15),
    source: clean(input.source || "site", 120),
    section: clean(input.section, 120),
    context: clean(input.context, 600),
    page: clean(input.page, 700),
    referrer: clean(input.referrer, 700)
  };
}

export function validateLeadInput(input = {}) {
  const lead = normalizeLeadInput(input);
  const errors = [];
  if (lead.name.length < 2) errors.push("INVALID_NAME");
  if (lead.phone.length < 10 || lead.phone.length > 15) errors.push("INVALID_PHONE");
  return { ok: errors.length === 0, lead, errors };
}

export function isDuplicateByPhone(existingRows = [], phone) {
  const target = onlyDigits(phone, 15);
  if (!target) return false;
  return existingRows.some(row => onlyDigits(row?.phone, 15) === target);
}
