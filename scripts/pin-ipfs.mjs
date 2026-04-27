import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

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

const formData = new FormData();

for (const filePath of files) {
  const bytes = await readFile(filePath);
  const relativePath = relative(sourceDir, filePath).split(sep).join("/");
  formData.append("file", new Blob([bytes]), relativePath);
}

formData.append(
  "pinataMetadata",
  JSON.stringify({
    name: pinName,
  }),
);

formData.append(
  "pinataOptions",
  JSON.stringify({
    cidVersion: 1,
  }),
);

const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${pinataJwt}`,
  },
  body: formData,
});

const text = await response.text();

if (!response.ok) {
  throw new Error(`Pinata pin failed (${response.status}): ${text}`);
}

const result = JSON.parse(text);
const cid = result.IpfsHash;

console.log(`Pinned ${sourceDir} to IPFS: ${cid}`);
console.log(`Gateway: https://${cid}.ipfs.dweb.link/`);

if (process.env.GITHUB_OUTPUT) {
  await import("node:fs/promises").then(({ appendFile }) =>
    appendFile(process.env.GITHUB_OUTPUT, `cid=${cid}\n`),
  );
}

