# Idle Heroes Account Viewer & Data Tracker

A fully secure, privacy-focused recreation of the Idle Heroes game interface that allows you to view, track, and share your complete account data directly in your browser. This visual system operates with **zero central storage** and no unnecessary uploads - your data stays with you.

<div align="center">
<a href="https://ih-accounts.github.io/" target="_blank">
  <div>
    <img src="IdleHeroesicon.png" alt="Idle Heroes" width="150" height="150">
  </div>
  <div>
    <img src="idleheroestitle-removebg.png" alt="Idle Heroes Title" width="300">
  </div>
  <div>
    <img src="https://img.shields.io/badge/LAUNCH%20LIVE%20SITE-%E2%86%92-e1c06f?style=for-the-badge&labelColor=873ec7&color=060a1a&logoWidth=50&logoColor=e1c06f" alt="LAUNCH LIVE SITE" width="280">
  </div>
</a>
</div>

## Stats
Total tracked accounts: [![](https://img.shields.io/badge/Accounts-0-blue)](https://github.com/IH-Accounts/IH-Accounts.github.io/blob/main/stats/account-stats.json)

## Key Features

- **100% Private & Secure**: Your data never leaves your device unless you explicitly share it
- **Complete Account Data Tracking**: View and track all your game data including:
  - **Heroes Tab**: All heroes with their stats, star levels, enables, stones, artifacts, and more
  - **Inventory Tab**: Complete inventory tracking including scrolls, prophet orbs, hero shards, artifact fragments, and all resources
  - **Summary View**: Account level, resources, and account statistics
- **Persistent Account URLs**: Each account gets a permalink, bookmarkable link (#Platform=UID format) that always shows the latest data
- **Browser-Based Storage**: Data is stored locally in your browser's IndexedDB, indexed by account UID+server-ID
- **QR Code Sharing**: Generate QR codes for easy mobile sharing with guild mates and friends
- **Powerful Filtering & Sorting**: Organize heroes and inventory data by star level, faction, power, and more
- **Offline Support**: Works even without internet once loaded
- **Mobile-Friendly Design**: Responsive layout works perfectly on all devices

## How It Works

1. **Real-time Capturing**: Use our iOS/Android profiles to capture data directly as you play Idle Heroes
   - **Extremely Lightweight**: Captures only essential game data (approximately 5kb of traffic)
   - **Real-time Processing**: Instantly processes game traffic while you play
   - **Zero Impact**: No noticeable performance or bandwidth impact while playing
   - **Account-specific**: Only captures the exact account you're currently playing - impossible to fake
2. **Data Compression**: Your game data is securely compressed using zlib and encoded as URL-safe base64
3. **Local Storage**: Account data is stored locally in your browser's IndexedDB, never on remote servers

## Game Data Capture Profiles

The Account Viewer uses specialized profiles to capture your game data in real-time while you play:

### iOS Profile (.mobileconfig)
- **What it does**: Creates a lightweight transparent proxy that only watches Idle Heroes network traffic
- **Installation**: Download from our GitHub Releases page and install via Settings app
- **Real-time capture**: Instantly processes the minimal data needed as you play (approximately 5kb)
- **Zero impact**: No noticeable impact on gameplay or battery life
- **Privacy**: Only captures essential game data - no personal information or unrelated traffic is monitored

### Android Profile (.conf)
- **What it does**: Creates a targeted proxy configuration that only intercepts Idle Heroes game data
- **Installation**: Download from GitHub Releases and import into HTTP Toolkit or similar app
- **Efficient processing**: Processes game data in milliseconds as you play
- **Minimal footprint**: Only captures the exact data needed to display your account
- **Privacy-focused**: Ignores all traffic except the specific game data needed for the viewer

For detailed technical information about how these profiles work, their security model, and all other system components, please see our [Technical Documentation](TECHNICAL_DOCUMENTATION.md).

## Privacy & Security

- **No Central Storage**: Account data is either stored locally in your browser or embedded directly in the share URL
- **Account Protection**: Only legitimate account owners can update their data - the system uses UID+server-ID as the primary key
- **Minimal Data**: Only what's visible in-game is ever shown/shared (name, UID, server, guild, heroes, inventory)
- **Open Source**: All code is open-source for transparency and security auditing

## Getting Started

### Viewing Account Data

1. Visit [https://ih-accounts.github.io/](https://ih-accounts.github.io/)
2. Enter an account URL in the format `https://ih-accounts.github.io/#account=UID-SERVERID` or with embedded data
3. The viewer will display all available account information

### Sharing Your Account

1. Generate your account URL by capturing data from the game
2. Copy the URL from the "Share This Account" section
3. Optionally generate a QR code for mobile sharing
4. Share with friends, guild mates, or bookmark for yourself

## Installation

No installation needed! Just visit [https://ih-accounts.github.io/](https://ih-accounts.github.io/) to use the tool directly in your browser.

To capture your own game data, download the appropriate profile from the [releases page](https://github.com/IH-Accounts/IH-Accounts.github.io/releases/latest).

## Security Architecture

The Idle Heroes Account Viewer implements a comprehensive security architecture designed to protect your privacy while providing a seamless experience:

### Multi-layered Security Model

- **Zero-Knowledge Design**: The system operates without any knowledge of your personal information
- **No Server Communication**: After loading the web app, no data is sent to any server
- **Client-Side Only**: All processing happens locally in your browser
- **Secure Data Capture**: The data capture profiles are designed with minimal permissions
- **Tamper-Proof Profiles**: Only official builds can generate valid capture profiles
- **Integrity Verification**: All data is validated before display to prevent manipulation
- **URL Safety**: Shared URLs contain only game data, never personal information

### Data Protection Features

- **Local Storage Encryption**: IndexedDB data is stored with browser security protections
- **Minimal Data Collection**: Only essential game information is captured (approximately 5kb)
- **Real-Time Processing**: Data is processed instantly and never stored in intermediate files
- **Profile Validation**: Each profile includes integrity verification mechanisms
- **Code Transparency**: All code is open source and can be audited by anyone
- **Domain Isolation**: Data capture is isolated to only the Idle Heroes game domain
- **Cryptographic Verification**: Critical components use cryptographic verification

For a detailed technical explanation of the security model, please refer to the [Technical Documentation](TECHNICAL_DOCUMENTATION.md).

## How Data Sharing Actually Works

### Permanent Account Links - Share Once, Always Updated

**Your account now has a permanent link** that never changes, but always shows your latest data. Here's how our innovative system works:

1. **You get a permanent, shareable account URL**: Something like `https://ih-accounts.github.io/account/Platform=UID` (e.g., `https://ih-accounts.github.io/account/iOS=123456`)

2. **Share this link once with friends**: This is your permanent account address - it never changes

3. **Link automatically shows latest data**: Whenever someone visits your link, they see your most current game data

4. **Tiny data updates (only 10 bytes)**: When you play with the profile active, it sends a tiny update to refresh your account data

5. **No login needed**: The system recognizes your unique game ID automatically from the `/account/Platform=UID` format

6. **Perfect for guild sharing**: Share once with your guild, and they'll always see your latest progress

### Behind the Scenes - How It Works

When you use the `/account/Platform=UID` URL format (e.g., `/account/iOS=123456`):

1. The unique identifier in the path tells the system exactly which account to load
2. The system instantly retrieves the latest compressed data for that specific account
3. This tiny data packet (approximately 10 bytes) contains your complete account information
4. The viewer automatically decompresses and displays your heroes, inventory, and stats

**This means your permanent URL (like `https://ih-accounts.github.io/account/iOS=123456`) is always current** - no need to generate a new link each time you play. Friends can bookmark your link once and always see your latest progress.

## License

This project is open-source software licensed under the MIT license.

## Privacy Policy

This tool does not collect, store, or transmit any personal information. All data is stored locally in your browser or embedded in URLs for sharing. No third-party analytics or tracking is used.

## Full Source Code Transparency

This project is completely open source, meaning:

- **100% Transparent**: Every line of code is available for inspection
- **No Hidden Functionality**: What you see is what you get - no hidden tracking

All tracking functionality is visible in the source code. We only track what's shown in the app:
- Heroes and their attributes
- Inventory items and quantities
- Account information visible in-game

## Disclaimer

This tool is not affiliated with, endorsed by, or connected to Idle Heroes or DH Games in any way. This is an unofficial, fan-made project created for educational purposes and to help players visualize their game data.

All game content, assets, characters, and related materials are the property of their respective owners. This project does not store or collect any game data centrally - all data is either stored locally in your browser or contained in shareable URLs.
