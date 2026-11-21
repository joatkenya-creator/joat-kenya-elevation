// CSV export: formula injection is neutralised and quoting is correct.
import assert from "node:assert/strict";
import { csvCell } from "../src/portal/csv.ts";

assert.equal(csvCell('=HYPERLINK("http://x")'), `"'=HYPERLINK(""http://x"")"`);
assert.equal(csvCell("+254712"), `"'+254712"`);
assert.equal(csvCell("-5.25"), `"-5.25"`);
assert.equal(csvCell("-1+2"), `"'-1+2"`);
assert.equal(csvCell("@SUM(A1)"), `"'@SUM(A1)"`);
assert.equal(csvCell("Jo, Amb"), `"Jo, Amb"`);
assert.equal(csvCell(null), `""`);
assert.equal(csvCell(12.5), `"12.5"`);
console.log("all passed");
