import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { PinataSDK } from "pinata";

async function loadLocalEnv(filePath = ".env") {
  try {
    const content = await readFile(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.includes("=")
        ? line.indexOf("=")
        : line.indexOf(":");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();

      if (!key || process.env[key]) {
        continue;
      }

      let value = line.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

await loadLocalEnv();

const pinataJwt = process.env.PINATA_JWT;
const sourceDir = process.env.IPFS_SOURCE_DIR ?? "dist";
const pinName = process.env.PINATA_NAME ?? "taggr-gallery-client";

if (!pinataJwt) {
  console.log("PINATA_JWT is not set. Build completed; skipping IPFS pin.");
  process.exit(0);
}

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const info = await stat(path);

    if (info.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (info.isFile()) {
      files.push(path);
    }
  }

  return files;
}

const files = await collectFiles(sourceDir);

if (files.length === 0) {
  throw new Error(`No files found in ${sourceDir}. Run npm run build first.`);
}

const uploadFiles = await Promise.all(
  files.map(async (filePath) => {
    const bytes = await readFile(filePath);
    const relativePath = relative(sourceDir, filePath).split(sep).join("/");

    return new File([bytes], relativePath);
  }),
);

const pinata = new PinataSDK({
  pinataJwt,
});

const result = await pinata.upload.public.fileArray(uploadFiles).name(pinName);
const cid = result.cid;

console.log(`Pinned ${sourceDir} to IPFS: ${cid}`);
console.log(`Gateway: https://${cid}.ipfs.dweb.link/`);

if (process.env.GITHUB_OUTPUT) {
  await import("node:fs/promises").then(({ appendFile }) =>
    appendFile(process.env.GITHUB_OUTPUT, `cid=${cid}\n`),
  );
}

