import assert from "node:assert/strict";
import test from "node:test";
import { isMeinoControlVercelHost } from "@/config/admin";

test("control-host recognition is exact and rejects lookalikes", () => {
  assert.equal(isMeinoControlVercelHost("meinocontrol.vercel.app"), true);
  assert.equal(isMeinoControlVercelHost("meinocontrol-git-pwa-hbg1.vercel.app"), true);
  assert.equal(isMeinoControlVercelHost("meinocontrol.vercel.app.attacker.example"), false);
});
