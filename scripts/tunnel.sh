#!/usr/bin/env bash
# Point cloudflared at IPv4 so it doesn't try [::1]:5173 (connection refused on many setups).
# Run from repo root: ./scripts/tunnel.sh
exec cloudflared tunnel --url http://127.0.0.1:5173
