#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Script to install and set up the Pre-Cana Workshop application on Debian ---

echo "--- Starting installation for Pre-Cana Workshop ---"

# 1. Update package lists
echo "--- [1/5] Updating package lists... ---"
sudo apt-get update -y

# 2. Install prerequisites (curl, gnupg for repository management)
echo "--- [2/5] Installing prerequisite packages (curl, gnupg)... ---"
sudo apt-get install -y curl gnupg

# 3. Install Node.js (using NodeSource for a modern version, e.g., 20.x)
echo "--- [3/5] Setting up Node.js repository and installing Node.js... ---"
# Check if Node.js is already installed to avoid re-installation
if ! command -v node > /dev/null; then
    NODE_MAJOR=20
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
    sudo apt-get update -y
    sudo apt-get install nodejs -y
    echo "Node.js installed successfully."
else
    echo "Node.js is already installed. Skipping installation."
fi
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"


# 4. Install project dependencies
echo "--- [4/5] Installing project dependencies with npm... ---"
npm install

# 5. Build the application for production
echo "--- [5/5] Building the Next.js application... ---"
npm run build

echo ""
echo "--- Installation and setup complete! ---"
echo ""
echo "To run the application in production mode, use the following command:"
echo "npm start"
echo ""
