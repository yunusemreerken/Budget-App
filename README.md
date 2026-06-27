# Budget App 💰

A simple personal budget tracker inspired by Monefy. Available on macOS, Windows, and Android.

![License](https://img.shields.io/badge/license-MIT-green)
![macOS](https://img.shields.io/badge/macOS-11%2B-blue)
![Windows](https://img.shields.io/badge/Windows-10%2B-0078D4)
![Android](https://img.shields.io/badge/Android-8%2B-3DDC84)

---

## Platforms

| Platform | Stack | Folder |
|----------|-------|--------|
| macOS | Electron + HTML/CSS/JS | [`budget-app-macos`](./budget-app-macos) |
| Windows | Electron + HTML/CSS/JS | [`budget-app-windows`](./budget-app-windows) |
| Android | React Native | [`budget-app-android`](./budget-app-android) |

---

## Features

- Add income and expense transactions
- Categorize spending (food, transport, rent, health, shopping…)
- Donut chart overview of monthly expenses
- Month-by-month navigation
- Data stored locally on device — no account, no cloud, no ads

---

## Project Structure

```
budget-app/
├── budget-app-macos/       # macOS desktop app (Electron)
├── budget-app-windows/     # Windows desktop app (Electron)
└── budget-app-android/     # Android mobile app (React Native)
```

---

## Getting Started

Each platform has its own setup guide. Click the folder link above or see the README inside each directory.

### macOS

```bash
cd budget-app-macos
bash install.sh
```

### Windows

```bash
cd budget-app-windows
install.bat
```

### Android

```bash
cd budget-app-android
npm install
npx react-native run-android
```

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## License

MIT