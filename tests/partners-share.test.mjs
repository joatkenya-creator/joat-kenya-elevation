// Share messages and network URLs (Links screen): code + link + disclosure in
// the text, UTM tags added without touching ref/ln.
import assert from "node:assert/strict";
import {
  acceptsCodes,
  codeMessage,
  networkShare,
  shareMessage,
  withUtm,
} from "../src/portal/share.ts";

const link = "https://amaresbigplanet.com/?ref=98NXCR22&ln=AB12CD34";
const tagged = withUtm(link, "whatsapp");
const u = new URL(tagged);
assert.equal(u.searchParams.get("ref"), "98NXCR22");
assert.equal(u.searchParams.get("ln"), "AB12CD34");
assert.equal(u.searchParams.get("utm_source"), "whatsapp");
assert.equal(u.searchParams.get("utm_medium"), "ambassador");

const msg = shareMessage("amare", tagged, "98NXCR22");
assert.ok(msg.includes(tagged));
assert.ok(msg.includes("ambassador code 98NXCR22"));
assert.ok(msg.includes("may earn a commission"));
assert.ok(!/discount/i.test(msg), "must not call the code a discount");
assert.ok(!/discount/i.test(codeMessage("amare", "98NXCR22")));
assert.equal(
  codeMessage("amare", "98NXCR22"),
  "Use my code 98NXCR22 when you shop at Amare's Big Planet, amaresbigplanet.com",
);
assert.ok(
  shareMessage("joat", "https://joatkenya.com/?ref=X", "X").includes("may earn a commission"),
);
assert.equal(acceptsCodes("amare"), true);
assert.equal(acceptsCodes("joat"), false);

const wa = networkShare("whatsapp", msg, tagged);
assert.equal(decodeURIComponent(wa.href.split("text=")[1]), msg);
const fb = networkShare("facebook", msg, tagged);
assert.ok(fb.href.startsWith("https://www.facebook.com/sharer/sharer.php?u="));
assert.equal(fb.copy, msg);
const x = new URL(networkShare("x", msg, tagged).href);
assert.equal(x.searchParams.get("url"), tagged);
assert.ok(!x.searchParams.get("text").includes(tagged), "X gets the URL once, not twice");
const tg = new URL(networkShare("telegram", msg, tagged).href);
assert.equal(tg.searchParams.get("url"), tagged);
const ig = networkShare("instagram", msg, tagged);
assert.equal(ig.href, "https://www.instagram.com/");
assert.ok(ig.toast.includes("Instagram"));
console.log("all passed");
