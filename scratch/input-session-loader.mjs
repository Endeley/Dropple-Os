import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve as pathResolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, "..");
const messageBusUrl = pathToFileURL(pathResolve(projectRoot, "scratch/mockMessageBus.mjs")).href;

export function resolve(specifier, context, nextResolve) {
  if (specifier === "@/core/messageBus") {
    return { url: messageBusUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
