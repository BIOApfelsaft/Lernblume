# Lernblume - Local Gradebook 

A privacy-first, offline desktop application designed for primary school teachers to manage alternative grading systems and competency matrices. Built with Nuxt 4, Tauri, and SQLite, this tool ensures that all sensitive student data remains strictly on the teacher's local machine, providing 100% GDPR compliance with zero cloud syncing. 

Features include customizable grading scales (e.g., ++, +, ~, -), competency tracking by subject, and automated PDF reporting.

## Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (includes npm)
* [Rust](https://rustup.rs/)
* [C++ Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Required for Desktop Development with C++ on Windows)

## Setup

Clone the repository and install the web dependencies:
\`\`\`bash
npm install
\`\`\`

## Development

Start the development server. This will launch the native Tauri window running the Nuxt frontend (with Hot-Module-Replacement active on `http://localhost:3000`):
\`\`\`bash
npm run tauri dev
\`\`\`

## Production Build

Compile the application into a standalone, installable executable for your current operating system:
\`\`\`bash
npm run tauri build
\`\`\`