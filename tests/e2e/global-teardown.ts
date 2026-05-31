/**
 * Deletes every order + customer created by the suite (buyer emails carry the
 * `+e2e-` marker) so the shared dev DB stays clean across runs.
 */
import { execFileSync } from "node:child_process";

export default function globalTeardown(): void {
  try {
    const out = execFileSync(
      "node",
      [
        "--env-file=.env",
        "--import",
        "tsx",
        "tests/e2e/helpers/db-cli.ts",
        "cleanup",
        "--marker",
        "+e2e-",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const line = out.split("\n").find((l) => l.startsWith("__E2E_RESULT__"));
    if (line) console.log("[e2e teardown]", line.replace("__E2E_RESULT__", ""));
  } catch (err) {
    console.error("[e2e teardown] cleanup failed", err);
  }
}
