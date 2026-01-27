#!/usr/bin/env node
/**
 * Fully automated Vert local server launcher.
 * Works on Windows, macOS, Linux.
 * Auto-starts Docker Desktop if needed.
 */

import { spawn, execSync } from "child_process";

const IMAGE = "ghcr.io/vert-lang/vert-server:latest";
const PORT = 3001;

function log(msg) {
  console.log(`\x1b[36m[vert]\x1b[0m ${msg}`);
}

function dockerExists() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function tryStartDockerDesktop() {
  log("Trying to start Docker Desktop...");

  try {
    if (process.platform === "win32") {
      execSync(
        `powershell -Command "Start-Process 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe'"`,
        { stdio: "ignore" }
      );
    } else if (process.platform === "darwin") {
      execSync(`open -a Docker`, { stdio: "ignore" });
    }
  } catch {
    log("Could not auto-start Docker Desktop. User may need to start it manually.");
  }
}

function dockerRunning() {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function waitForDocker() {
  log("Checking Docker daemon...");
  if (dockerRunning()) return log("Docker is running.");

  tryStartDockerDesktop();

  while (!dockerRunning()) {
    log("Waiting for Docker to start...");
    await new Promise(r => setTimeout(r, 2000));
  }

  log("Docker is ready.");
}

async function pullImage() {
  log(`Ensuring Vert image is available: ${IMAGE}`);
  try {
    execSync(`docker pull ${IMAGE}`, { stdio: "inherit" });
  } catch {
    log("⚠ Failed to pull image. Using existing local image if available.");
  }
}

async function waitForHealth() {
  log("Waiting for Vert health endpoint...");

  const url = `http://localhost:${PORT}/health`;

  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        log("Vert server is healthy.");
        return;
      }
    } catch {}

    await new Promise(r => setTimeout(r, 1000));
  }
}

export async function startVertServer() {
  if (!dockerExists()) {
    console.error(`
ERROR: Docker is not installed.
Install Docker Desktop:
https://www.docker.com/products/docker-desktop
`);
    process.exit(1);
  }

  await waitForDocker();
  await pullImage();

  // Ensure no old container running
  try {
    execSync("docker rm -f vert-server", { stdio: "ignore" });
  } catch {}

  log("Starting Vert server container...");

  const args = [
    "run",
    "--rm",
    "-p", `${PORT}:3001`,
    "--name", "vert-server",
    IMAGE
  ];

  const proc = spawn("docker", args, { stdio: "inherit" });

  proc.on("close", (code) => {
    log(`Vert container exited with code ${code}`);
  });

  process.on("SIGINT", () => {
    log("Stopping Vert server...");
    try { execSync("docker stop vert-server"); } catch {}
    process.exit(0);
  });

  await waitForHealth();
}
