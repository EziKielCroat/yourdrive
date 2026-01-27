#!/usr/bin/env node
import { spawn, execSync } from "child_process";
import path from "path";
import fs from "fs";

const root = path.resolve();
const isWin = process.platform === "win32";

let processes = [];

// --- Logging ---
function log(msg, color = 35) {
  console.log(`\x1b[${color}m[dev]\x1b[0m ${msg}`);
}

// --- Spawn child processes safely ---
function run(label, cwd, args = ["run", "dev"]) {
  const cmd = isWin ? "npm.cmd" : "npm";

  const proc = spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: "inherit",
    detached: !isWin, // detached only on Unix
  });

  processes.push({ label, proc });

  proc.on("close", (code) =>
    log(`${label} stopped (code ${code})`, 31)
  );

  return proc;
}

// --- Detect monorepo structure ---
function detectStructure() {
  const combos = [
    { api: "apps/api", web: "apps/web" },
    { api: "api", web: "web" },
    { api: "api", web: "client" },
  ];
  return combos.find(
    (s) =>
      fs.existsSync(path.join(root, s.api)) &&
      fs.existsSync(path.join(root, s.web))
  );
}

// --- Docker helpers ---
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
  log("Building Vert image from GitHub...", 33);
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
      "https://github.com/VERT-sh/VERT.git",
    ].join(" "),
    { stdio: "inherit" }
  );
}

function runVertContainer() {
  log("Starting Vert container...", 33);
  try {
    execSync(
      "docker run -d --name vert -p 3001:80 --restart unless-stopped vert-local",
      { stdio: "inherit" }
    );
  } catch {
    log("⚠ Existing Vert container detected. Removing...", 33);
    try {
      execSync("docker rm -f vert", { stdio: "inherit" });
      execSync(
        "docker run -d --name vert -p 3001:80 --restart unless-stopped vert-local",
        { stdio: "inherit" }
      );
    } catch (err2) {
      log(`❌ Could not start Vert: ${err2.message}`, 31);
      return false;
    }
  }
  return true;
}

// --- Terminal dashboard ---
function printDashboard() {

  // todo make actually changeable with the env
  const lines = [
    "Dev Environment Started Successfully!",
    "Web:         http://localhost:5173/",
    "API:         http://localhost:3000/",
  ];

  const maxLength = Math.max(...lines.map((line) => line.length));
  const border = "═".repeat(maxLength + 2);

  const padLine = (text) => `║ ${text.padEnd(maxLength)} ║`;

  console.log(`\n╔${border}╗`);
  console.log(padLine(lines[0]));
  console.log(`╠${border}╣`);
  for (let i = 1; i < lines.length; i++) console.log(padLine(lines[i]));
  console.log(`╚${border}╝\n`);
  console.log("Press Ctrl+C to stop everything gracefully.\n");
}

// --- Graceful shutdown ---
function cleanup() {
  log("Shutting down dev environment...", 33);

  // Kill all child processes
  for (const { label, proc } of processes) {
    try {
      if (isWin) {
        execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" });
      } else {
        process.kill(-proc.pid);
      }
      log(`${label} stopped`, 32);
    } catch {}
  }

  // Remove Vert container if running
  // try {
  //  execSync("docker rm -f vert", { stdio: "ignore" });
  //} catch {}

  log("Cleanup complete.", 32);
  console.log("\nYou can now continue using this terminal.\n");
}

// --- Main ---
(async () => {
  console.clear();
  log("Starting full dev environment...", 36);

  const structure = detectStructure();
  if (!structure) {
    console.error("Could not detect project structure.");
    process.exit(1);
  }

  // log("Checking Docker...", 36);
  // if (!isDockerRunning()) {
  //   log("Docker not running. Please start Docker Desktop.", 31);
  //   process.exit(1);
  // }
  // log("Docker is running", 32);

  // if (!isImagePresent("vert-local")) buildVertImage();
  // else log("Vert image already exists locally", 32);

  // runVertContainer(); // optional

  // Start API & Web
  run("API", path.join(root, structure.api));
  setTimeout(() => run("Web", path.join(root, structure.web)), 500);

  setTimeout(printDashboard, 2000);

  // Catch signals
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
})();
