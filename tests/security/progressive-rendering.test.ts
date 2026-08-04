import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("primary server-rendered content is not hidden before hydration", async () => {
  const files = ["src/app/template.tsx", "src/components/ui/FadeIn.tsx", "src/components/listing/ListingCard.tsx"];
  for (const file of files) {
    const source = await readFile(resolve(file), "utf8");
    assert.match(source, /initial=\{false\}/);
  }
});
