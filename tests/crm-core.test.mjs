import assert from "node:assert/strict";
import { clean, onlyDigits, daysClause } from "../src/crm-core/utils.js";
import { normalizeLeadInput, validateLeadInput, isDuplicateByPhone } from "../src/crm-core/leads.js";
import { normalizeLifecycle, normalizeOutcome, canCloseAsLost, canCloseAsWon } from "../src/crm-core/lifecycle.js";
import client from "../src/crm-client/camilla.config.js";

assert.equal(clean("  Camilla  ", 100), "Camilla");
assert.equal(onlyDigits("(83) 99999-9999"), "83999999999");

const period = daysClause(30);
assert.equal(period.sql.includes("created_at"), true);
assert.deepEqual(period.bind, ["-30 days"]);

const lead = normalizeLeadInput({
  name: "  Maria  ",
  phone: "(83) 98888-7777",
  source: "site_camilla",
  section: "curadoria"
});
assert.equal(lead.name, "Maria");
assert.equal(lead.phone, "83988887777");
assert.equal(lead.source, "site_camilla");

assert.equal(validateLeadInput({ name: "A", phone: "123" }).ok, false);
assert.equal(validateLeadInput({ name: "Maria", phone: "83988887777" }).ok, true);

assert.equal(isDuplicateByPhone([{ phone: "(83) 98888-7777" }], "83 98888-7777"), true);
assert.equal(isDuplicateByPhone([{ phone: "83911112222" }], "83988887777"), false);

assert.equal(normalizeLifecycle("qualified"), "qualified");
assert.equal(normalizeLifecycle("unknown"), "waiting");
assert.equal(normalizeOutcome("won"), "won");
assert.equal(normalizeOutcome("invalid"), "open");

assert.equal(canCloseAsLost({ outcome: "lost", lossReason: "" }), false);
assert.equal(canCloseAsLost({ outcome: "lost", lossReason: "Sem retorno" }), true);
assert.equal(canCloseAsWon({ outcome: "won", dealValueCents: 0 }), false);
assert.equal(canCloseAsWon({ outcome: "won", dealValueCents: 100000 }), true);

assert.equal(client.id, "camilla-bonifacio");
assert.equal(client.platform, "cloudflare");
assert.equal(client.bindings.database, "DB");
assert.equal(client.features.realEstatePipeline, true);

console.log("CRM core tests: OK");
