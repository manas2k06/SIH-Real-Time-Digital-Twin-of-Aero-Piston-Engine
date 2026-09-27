#!/usr/bin/env bash
# AeroTwin MALE-UAV Aero-Piston Engine Digital Twin - One-Click Launcher

echo "====================================================================="
echo "  AEROTWIN: Real-Time Digital Twin for MALE-UAV Aero-Piston Engine"
echo "  Smart India Hackathon (SIH) - Rotax 914F Core Powerplant Console"
echo "====================================================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend" || exit 1

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not found in PATH."
    echo "Please install Node.js (v18+) from https://nodejs.org/ and run this script again."
    read -p "Press Enter to exit..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] First-time setup detected: Installing npm dependencies..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERROR] Dependency installation encountered an issue."
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo ""
    echo "[SUCCESS] Dependencies installed successfully."
    echo ""
fi

echo "[INFO] Launching AeroTwin dev server..."
echo "[INFO] Opening dashboard in your default browser at http://localhost:3000/"
echo ""

# Automatically launch default browser at http://localhost:3000/
(sleep 2 && (command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000/ || command -v open >/dev/null 2>&1 && open http://localhost:3000/)) >/dev/null 2>&1 &

npm run dev
