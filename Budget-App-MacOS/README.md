# Bütçem 💰

A simple personal budget tracker for macOS, inspired by Monefy. Built with Electron.

![macOS](https://img.shields.io/badge/macOS-11%2B-blue) ![Electron](https://img.shields.io/badge/Electron-36-47848F) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- Track income and expenses by category
- Donut chart overview of spending
- Month-by-month navigation
- Data persisted locally on your Mac
- Native macOS feel — dark mode, hidden title bar, blur effects
- Keyboard shortcut: `Cmd+N` to add a transaction

## Installation

### Requirements

- macOS 11 or later
- [Node.js LTS](https://nodejs.org)

### Steps

```bash
git clone https://github.com/YOUR_USERNAME/budgetem.git
cd budgetem
bash install.sh
```

The install script will:
1. Install dependencies via `npm install`
2. Package the app with Electron Forge
3. Copy `Bütçem.app` to `/Applications`
4. Remove Gatekeeper restrictions
5. Launch the app automatically

### First launch (if macOS blocks the app)

Right-click the app → **Open** → confirm in the dialog.

Or run in terminal:
```bash
xattr -cr /Applications/Bütçem.app
```

## Running from source

```bash
npm install
npm start
```

## Tech stack

- [Electron](https://www.electronjs.org) — desktop shell
- [Electron Forge](https://www.electronforge.io) — packaging & distribution
- Vanilla HTML/CSS/JS — no frontend framework
- Native Canvas API — donut chart (no external chart library)

## Data storage

Transactions are saved locally to:
```
~/Library/Application Support/Bütçem/transactions.json
```

## License

MIT
