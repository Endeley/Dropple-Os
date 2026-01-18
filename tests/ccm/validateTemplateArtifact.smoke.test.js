import fs from "node:fs";
import path from "node:path";
import { validateTemplateArtifact } from "../../core/ccm/validate/validateTemplateArtifact.js";

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing artifact file: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function assertDoesNotThrow(fn, message) {
  try {
    fn();
  } catch (err) {
    console.error(err);
    throw new Error(message);
  }
}

const artifactPath = path.resolve(
  process.cwd(),
  "templates",
  "artifacts",
  "realestate.hero.motion.v1.json"
);

const realEstateHero = loadJson(artifactPath);

assertDoesNotThrow(
  () => {
    validateTemplateArtifact(realEstateHero);
  },
  "CCM smoke test failed: flagship template should be valid"
);

console.log("CCM smoke test passed: flagship template is valid");
