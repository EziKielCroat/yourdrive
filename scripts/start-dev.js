#!/usr/bin/env node
import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";

const root = path.resolve();
const isWin = process.platform === "win32";

function log(msg) {
  console.log(`\x1b[35m[dev]\x1b[0m ${msg}`);
}

function run(label, cwd, args = ["run", "dev"]) {
  const cmd = isWin ? "npm.cmd" : "npm";
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: "inherit" });
  proc.on("close", () => log(`${label} stopped.`));
  return proc;
}

function detectStructure() {
  const combos = [
    { api: "apps/api", web: "apps/web" },
    { api: "api", web: "web" },
    { api: "api", web: "client" }
  ];
  return combos.find(
    s =>
      fs.existsSync(path.join(root, s.api)) &&
      fs.existsSync(path.join(root, s.web))
  );
}

function isDockerRunning() {
  try {
    const output = execSync("docker info", { stdio: "pipe" }).toString();
    return output.includes("Server Version");
  } catch {
    return false;
  }
}

function isImagePresent(imageName) {
  try {
    const output = execSync(`docker images -q ${imageName}`, { stdio: "pipe" }).toString();
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function buildVertImage() {
  log("Building Vert image from GitHub...");
  execSync(
    [
      "docker build",
      "-t vert-local",
      "--build-arg PUB_ENV=production",
      "--build-arg PUB_HOSTNAME=localhost:5173",
      "--build-arg PUB_PLAUSIBLE_URL=",
      "--build-arg PUB_VERTD_URL=",
      "--build-arg PUB_DONATION_URL=https://donations.vert.sh",
      "--build-arg PUB_DISABLE_ALL_EXTERNAL_REQUESTS=false",
      '--build-arg PUB_STRIPE_KEY=""',
      "https://github.com/VERT-sh/VERT.git"
    ].join(" "),
    { stdio: "inherit" }
  );
}

function runVertContainer() {
  log("Starting Vert container...");
  try {
    execSync(
      "docker run -d --name vert -p 3001:80 --restart unless-stopped vert-local",
      { stdio: "inherit" }
    );
  } catch {
    log("⚠ Existing Vert container detected. Removing...");
    try {
      execSync("docker rm -f vert", { stdio: "inherit" });
      execSync(
        "docker run -d --name vert -p 3001:80 --restart unless-stopped vert-local",
        { stdio: "inherit" }
      );
    } catch (err2) {
      log(`❌ Could not start Vert: ${err2.message}`);
      process.exit(1);
    }
  }
}

(async () => {
  console.clear();
  log("Starting full dev environment...");

  const structure = detectStructure();
  if (!structure) {
    console.error("Could not detect project structure.");
    process.exit(1);
  }

  log("Checking Docker...");
  if (!isDockerRunning()) {
    log("not running. Please start Docker Desktop.");
    process.exit(1);
  }
  log("Docker is running");

  if (!isImagePresent("vert-local")) {
    buildVertImage();
  } else {
    log("Vert image already exists locally");
  }

  // TODO: possibly remove or replace converter service
  // runVertContainer();

  // Start API & Web
  const api = run("API", path.join(root, structure.api));
  setTimeout(() => run("Web", path.join(root, structure.web)), 500);

  // Success message after short delay to give containers time to start
  setTimeout(() => {
    console.log("\n\x1b[42m\x1b[30mDev Environment Started Successfully! \x1b[0m\n");
    console.log("URLs:");
    console.log(`- Web:       \x1b[36mhttp://localhost:5173/\x1b[0m`);
    console.log(`- API:       \x1b[36mhttp://localhost:3000/\x1b[0m`);
    // console.log(`- VERT:      \x1b[36mhttp://localhost:3001/\x1b[0m\n`);
    console.log("Press Ctrl+C to stop everything.\n");
  }, 5000);

  process.on("SIGINT", () => {
    log("Shutting down dev environment...");
    api.kill();
    try { execSync("docker rm -f vert", { stdio: "inherit" }); } catch {}
    process.exit(0);
  });
})();
