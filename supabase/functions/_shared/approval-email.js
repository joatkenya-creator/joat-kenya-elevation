// The referral link and ambassador code in the approval email (partner-email,
// membership.approved). Plain JavaScript so the Node tests can check it.

/**
 * Lines for the plain-text body. The code is only mentioned where people can
 * type it (programmes with a shop: website box and cart field).
 */
export function shareLines({ code, siteUrl, hasShop, portal }) {
  const link = `${siteUrl}/?ref=${code}`;
  return {
    link,
    lines: [
      "",
      `Your referral link: ${link}`,
      ...(hasShop
        ? [
            `Your ambassador code: ${code}. People who visit the website directly can enter it on`,
            "the website or in the shop cart, so the sale is still credited to you.",
          ]
        : []),
      `Share it straight from your dashboard: ${portal}/dashboard (Links).`,
      "",
      "Always mention you're a JOAT Global ambassador and may earn a commission.",
    ],
  };
}

const esc = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const paragraphs = (lines) =>
  lines
    .join("\n")
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

/** HTML twin of the plain-text email: same words, code boxed, link as a button. */
export function approvalHtml({ hello, lines, signOff, code, link }) {
  const box = code
    ? `<p style="margin:8px 0 6px;font-size:13px;color:#555">Your ambassador code</p>` +
      `<p style="margin:0 0 18px"><span style="display:inline-block;padding:10px 18px;border:2px dashed #E8603C;border-radius:8px;background:#FFF4EF;font:700 24px/1 monospace;letter-spacing:3px;color:#1a1a2e">${esc(code)}</span></p>`
    : "";
  const button = `<p style="margin:0 0 22px"><a href="${esc(link)}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#E8603C;color:#ffffff;font-weight:700;text-decoration:none">Open your referral link</a></p>`;
  return (
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a2e;max-width:560px">` +
    paragraphs([hello, "", ...lines]) +
    box +
    button +
    paragraphs(signOff) +
    `</div>`
  );
}
