import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = new URL("../dist/", import.meta.url);
const manifestPath = new URL("manifest.json", root);
test("combined build preserves both engines and scoped permissions", { skip: !existsSync(manifestPath) }, () => {
  const manifest = JSON.parse(readFileSync(manifestPath));
  assert.equal(manifest.name, "YTMusic Remastered");
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.key, undefined);
  assert.equal(manifest.update_url, undefined);
  assert.deepEqual(manifest.host_permissions, ["https://music.youtube.com/*"]);
  assert.ok(manifest.content_scripts.some(s => s.matches.includes("https://music.youtube.com/*")));
  assert.ok(manifest.content_scripts.some(s => s.matches.includes("https://www.youtube.com/*")));
  for (const script of manifest.content_scripts) {
    for (const file of [...script.js || [], ...script.css || []]) assert.ok(existsSync(new URL(file, root)), file);
  }
  for (const file of [manifest.background.service_worker, manifest.action.default_popup, manifest.options_ui.page]) {
    assert.ok(existsSync(new URL(file, root)), file);
  }
});
