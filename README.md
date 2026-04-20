# learn

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Auto Update (Incremental)

This project uses `electron-builder` + `electron-updater`.
Incremental update relies on `.blockmap` files generated during release packaging.

### 1) Configure update feed

- `electron-builder.yml` controls packaged app update metadata:
  - `publish.provider: generic`
  - `publish.url: https://your-cdn.com/auto-updates` (replace before release)
- For local/dev validation, set `dev-app-update.yml` with the same update server.

### 2) Runtime behavior

- Main process initializes updater in `src/main/updater.ts`.
- App checks for updates on startup and every 30 minutes.
- Renderer can call preload APIs:
  - `window.api.winApi.checkForUpdates()`
  - `window.api.winApi.getUpdaterStatus()`
  - `window.api.winApi.onUpdaterStatus(listener)`
  - `window.api.winApi.quitAndInstall()`

### 3) Release artifacts to upload

Upload all generated files for a version, especially:

- metadata: `latest.yml` / `latest-mac.yml` / `latest-linux.yml`
- installers/packages: `*.exe`, `*.dmg`, `*.AppImage` (by platform target)
- diff files: `*.blockmap`

If `.yml` or `.blockmap` is missing on server, incremental update may fall back to full download or fail.
