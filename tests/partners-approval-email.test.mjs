// Approval email (Part 7): link, code (shop programmes only), dashboard
// pointer and disclosure in the text; HTML escapes and boxes the code.
import assert from "node:assert/strict";
import { approvalHtml, shareLines } from "../supabase/functions/_shared/approval-email.js";

const PORTAL = "https://partners.joatkenya.com";
const amare = shareLines({
  code: "98NXCR22",
  siteUrl: "https://amaresbigplanet.com",
  hasShop: true,
  portal: PORTAL,
});
const text = amare.lines.join("\n");
assert.equal(amare.link, "https://amaresbigplanet.com/?ref=98NXCR22");
assert.ok(text.includes("Your referral link: https://amaresbigplanet.com/?ref=98NXCR22"));
assert.ok(text.includes("Your ambassador code: 98NXCR22."));
assert.ok(text.includes("in the shop cart, so the sale is still credited to you"));
assert.ok(text.includes(`${PORTAL}/dashboard (Links)`));
assert.ok(
  text.includes("Always mention you're a JOAT Global ambassador and may earn a commission."),
);
assert.ok(!/discount/i.test(text), "never calls the code a discount");

// JOAT has no code entry: link only, still the disclosure.
const joat = shareLines({
  code: "JJJJ1111",
  siteUrl: "https://joatkenya.com",
  hasShop: false,
  portal: PORTAL,
});
assert.ok(joat.lines.join("\n").includes("https://joatkenya.com/?ref=JJJJ1111"));
assert.ok(!joat.lines.join("\n").includes("ambassador code"));
assert.ok(joat.lines.join("\n").includes("may earn a commission"));

const html = approvalHtml({
  hello: "Hello <Erick>,",
  lines: ["Congratulations!", ...amare.lines],
  signOff: ["", "JOAT Global Partners"],
  code: "98NXCR22",
  link: amare.link,
});
assert.ok(html.includes("Hello &lt;Erick&gt;,"), "escaped");
assert.ok(!html.includes("<Erick>"));
assert.ok(html.includes(">98NXCR22</span>"), "code in its box");
assert.ok(html.includes('href="https://amaresbigplanet.com/?ref=98NXCR22"'), "button link");
assert.ok(
  html.indexOf("98NXCR22</span>") < html.indexOf("JOAT Global Partners"),
  "box before sign-off",
);
assert.ok(
  !approvalHtml({ hello: "Hi", lines: [], signOff: [], code: null, link: "https://x" }).includes(
    "ambassador code",
  ),
);
console.log("all passed");
