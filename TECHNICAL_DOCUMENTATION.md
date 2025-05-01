# Technical Documentation: Idle Heroes Account Viewer

This document provides a detailed explanation of how the Idle Heroes Account Viewer works, including secure profile generation, data processing, and all implemented features.

## Table of Contents

- [Technical Documentation: Idle Heroes Account Viewer](#technical-documentation-idle-heroes-account-viewer)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Security Model](#security-model)
    - [Security Keys and GitHub Secrets](#security-keys-and-github-secrets)
  - [iOS Profile Generation](#ios-profile-generation)
    - [Technical Details](#technical-details)
    - [Implemented Features](#implemented-features)
  - [Android Profile Generation](#android-profile-generation)
    - [Technical Details](#technical-details-1)
    - [Implemented Features](#implemented-features-1)

## Architecture Overview

The Idle Heroes Account Viewer is designed as a fully client-side web application with zero server dependencies. The system consists of the following components:

- **Landing Page**: Entry point with feature descriptions and profile downloads
- **Viewer Application**: Core application for displaying account details
- **Profiles**: iOS and Android profiles for capturing game data
- **URL Utility**: Handling permanent URL format and sharing
- **Data Compressor**: Efficient compression of large datasets into URL format
- **Database Manager**: Local storage of account data in IndexedDB
- **Image Processing**: Handling game visuals and user experience

All components work together to deliver a seamless user experience while maintaining a strong focus on privacy and security.

## Security Model

The system implements a unique security model that combines full open-source transparency with secure profile authentication:

- **Open-Source Code**: All source code is publicly available for verification
- **Secret Build Component**: Only the official workflows can generate valid profiles via GitHub Secrets
- **No Central Data Storage**: No account data leaves your device unless you explicitly share it
- **URL Validation**: Shared links are verified for integrity before displaying data

### Security Keys and GitHub Secrets

To ensure that only the official repository can build valid profiles, we use a security key stored as a GitHub Secret. This key is integrated into the profiles during the build process but is never visible in the public source code.

## iOS Profile Generation

The iOS profile (`ios_profile_generator.py`) generates a `.mobileconfig` file that is installed on iOS devices to capture Idle Heroes game data in real-time.

### Technical Details

- **Profile Type**: Lightweight transparent network proxy configuration
- **Data Scope**: Captures only essential data from the Idle Heroes app (approximately 5kb)
- **Real-time Processing**: Processes data in milliseconds as you play
- **Security Verification**: Integrates secure token to ensure authenticity
- **Versioning**: Each profile contains a build number for traceability

### Implemented Features

- Automatic detection and filtering of Idle Heroes game traffic
- Extremely efficient data processing with minimal performance impact
- Instant transformation of game data to compressed format
- Zero-impact monitoring with no noticeable effect on gameplay or battery

## Android Profile Generation

The Android profile (`android_proxy_setup.py`) creates configuration files that are used with proxy apps like HTTP Toolkit for real-time game data capture.

### Technical Details

- **Format**: Targeted proxy configuration
- **Integration**: Compatible with popular Android proxy applications
- **Performance**: Processes game data in milliseconds with minimal footprint
- **Specificity**: Captures only the exact game data needed for the viewer
- **Security**: Contains verification tokens that ensure only official builds work properly

### Implemented Features

- Host-specific lightweight traffic monitoring
- Real-time data processing as you play
- Minimal battery and performance impact
- Intelligent filtering to capture only essential game information

## GitHub Actions Workflow

The project uses GitHub Actions for automated builds, profile generation, and deployment. The workflow is defined in `.github/workflows/idle-heroes-workflow.yml`.

### Security Scan Job

Performs preliminary security checks on the codebase:

- Searches for potentially exposed API keys or passwords
- Verifies that sensitive information is properly secured
- Runs before any other job to ensure security compliance

### Build Profiles Job

Generates the iOS and Android profiles required for game data capture:

- Uses Python scripts to create the profile configurations
- Incorporates the `PROFILE_SECURITY_KEY` from GitHub Secrets
- Includes version information for traceability
- Creates both iOS (`.mobileconfig`) and Android (`.conf`) profiles
- Uploads profiles as workflow artifacts

### Process Images Job

Downloads and optimizes game images for improved user experience:

- Retrieves official Idle Heroes images and optimizes them for web use
- Creates different versions of background images (standard and dimmed)
- Processes hero portraits and faction icons
- Generates an image manifest for easy integration
- Uploads processed images as artifacts

### Create Release Job

Publishes the generated profiles as a GitHub Release:

- Creates a new release with the workflow run number as version
- Attaches the iOS and Android profiles as downloadable assets
- Includes detailed installation instructions in the release notes
- Makes the release publicly accessible for users

### Deploy to Pages Job

Deploys the complete website to GitHub Pages:

- Updates profile download links to point to the latest release
- Configures GitHub Pages environment
- Uploads the entire site as a pages artifact
- Deploys to the GitHub Pages hosting service

## Data Compression and URL Format

The system employs an efficient compression mechanism to store large account datasets in URL format.

### Compression Process

1. **JSON Normalization**: Account data is normalized to remove unnecessary whitespace
2. **Data Optimization**: Common patterns are replaced with short tokens
3. **Zlib Compression**: Data is compressed using zlib algorithm
4. **Base64-URL Encoding**: Compressed data is encoded to be URL-safe

### URL Format

The system uses a path-based permanent URL format that follows this pattern:

```
https://ih-accounts.github.io/account/Platform=UID
```

Where:
- `Platform` is either "iOS" or "Android"
- `UID` is the unique identifier for the account

This format enables permanent links that always show the latest account data without requiring users to share new links when their account updates.

For backward compatibility, the system also supports the legacy hash-based format:

```
https://ih-accounts.github.io/#account=UID-SERVERID
```

### Data Validation

All shared URLs undergo validation before displaying account data:

- Hash component is extracted and decoded
- Compression integrity is verified
- JSON structure is validated
- Required fields are checked

## Local Storage with IndexedDB

Account data is stored locally in the browser's IndexedDB for persistence across sessions.

### Database Structure

- **Database Name**: `idle-heroes-accounts`
- **Object Store**: `accounts`
- **Key Path**: Combination of platform and UID

### Storage Operations

- **Save Account**: Stores account data with automatic version tracking
- **Load Account**: Retrieves account data by platform and UID
- **List Accounts**: Returns all stored accounts for quick access
- **Delete Account**: Removes a specific account from storage
- **Clear All**: Removes all stored accounts (with confirmation)

### Offline Support

The application implements a Service Worker that enables offline functionality:

- Caches all essential application resources
- Allows viewing previously loaded accounts without internet
- Updates cached resources when new versions are available

## Image Processing

The `image_utility.py` script handles downloading and optimizing Idle Heroes images for use in the web application.

### Image Categories

- **Hero Images**: Character portraits optimized for display in the heroes tab
- **Background Images**: Game backgrounds modified for better text readability
- **Faction Icons**: Faction symbols for hero categorization

### Processing Techniques

- **Resizing**: Large images are resized to appropriate dimensions
- **Compression**: All images are optimized for web delivery
- **Background Processing**: Slight blur and darkening for better text contrast
- **Manifest Generation**: Creates a JSON index of all available images

### Security Features

The image processor includes security verification to ensure only authorized installations can generate the complete set of visual assets.

## Advanced Features

### QR Code Sharing

The system can generate QR codes for account data URLs:

- Creates a QR code containing the compressed account data URL
- Allows for easy mobile sharing (scanning QR code with a mobile device)
- Includes the account platform and UID in the QR code metadata

### Hero Filtering and Sorting

The viewer includes advanced filtering and sorting capabilities:

- Filter by star level, faction, class, and more
- Sort by power, level, star level, or acquisition date
- Save filter/sort preferences in browser storage

### Export Functionality

Users can export their account data in various formats:

- **URL**: Generates a shareable URL with the account data
- **JSON**: Exports raw account data in JSON format
- **PNG**: Creates a screenshot of the current view (via browser)

### Progressive Web App Features

The application is built as a Progressive Web App with:

- Home screen installation capability
- Offline functionality
- App-like experience
- Fast loading through caching

## Core Files and Functionality

This section provides a detailed breakdown of each core file in the system and explains its exact functionality.

### Main Application Files

#### `index.html`

**Purpose**: Entry point and router for the entire application

**Key functionality**:
- Serves as the landing page for all URLs (both direct and permanent links)
- Contains a simple loader animation during redirection
- Routes users to either viewer.html or landing.html based on URL
- Integrates with account-redirector.js for permanent link handling
- Optimized for fast loading and immediate response

#### `landing.html`

**Purpose**: Marketing and information landing page

**Key functionality**:
- Showcases key features with visual elements and clear descriptions
- Provides direct download buttons for iOS and Android profiles
- Contains animated call-to-action elements
- Includes privacy and security information
- Links to the account viewer for users with existing accounts
- Uses Idle Heroes visual styling for brand consistency

#### `viewer.html`

**Purpose**: Main application interface for viewing account data

**Key functionality**:
- Renders account data in an organized, tabbed interface
- Displays heroes, inventory, and account summary information
- Provides filtering and sorting functionality for heroes and items
- Includes QR code generation for easy mobile sharing
- Contains export functions for data portability
- Integrates with URL sharing for direct account links
- Responsive design that works across all devices

### JavaScript Modules

#### `js/app.js`

**Purpose**: Core application initialization and coordination

**Key functionality**:
- Sets up application environment and dependencies
- Initializes keyboard shortcuts and event listeners
- Registers the service worker for offline functionality
- Coordinates between different modules (IdleHeroesViewer, DBManager, etc.)
- Handles global error states and application recovery
- Manages application lifecycle events

#### `js/account-redirector.js`

**Purpose**: Handles permanent account URLs and data retrieval

**Key functionality**:
- Parses `/account/Platform=UID` format URLs
- Retrieves latest account data for the specific Platform/UID combination
- Manages local caching of account data in IndexedDB
- Provides smooth redirection to the correct viewer URL
- Handles error states when account data is unavailable
- Implements the core logic for permanent account links

#### `js/idle-heroes-viewer.js`

**Purpose**: Core viewer implementation and data rendering

**Key functionality**:
- Processes and renders account data into visual components
- Implements the tabbed interface (Heroes, Inventory, Summary)
- Provides filtering and sorting mechanisms
- Handles hero detail modal views
- Manages data comparison and statistics calculation
- Implements inventory grouping and categorization
- Controls the account summary dashboard

#### `js/data-compressor.js`

**Purpose**: Handles data compression and decompression

**Key functionality**:
- Compresses large account data objects to minimal size (approx. 10 bytes)
- Uses Zlib compression with additional optimization
- Implements URL-safe base64 encoding
- Handles data versioning and backward compatibility
- Provides data integrity validation
- Includes performance optimizations for fast processing

#### `js/db-manager.js`

**Purpose**: Manages local data storage

**Key functionality**:
- Creates and maintains IndexedDB database structure
- Provides CRUD operations for account data
- Implements versioning for stored accounts
- Handles database migration and updates
- Provides account listing and management
- Implements data export and import functionality
- Manages storage quotas and cleanup

#### `js/url-utility.js`

**Purpose**: Handles URL operations and sharing

**Key functionality**:
- Parses and validates URL parameters
- Generates shareable URLs with compressed data
- Creates QR codes for mobile sharing
- Manages clipboard operations for link sharing
- Provides URL validation and sanitization
- Handles both legacy and new URL formats

### Server-Side Scripts

#### `tools/ios_profile_generator.py`

**Purpose**: Generates iOS mobileconfig profiles

**Key functionality**:
- Creates Apple mobileconfig XML structure
- Embeds secure tokens for authenticity verification
- Sets up network monitoring for only Idle Heroes traffic
- Configures proxy settings for data capture
- Integrates with GitHub Actions for automated builds
- Includes versioning information for tracking
- Contains minimal permissions to ensure privacy

#### `tools/android_proxy_setup.py`

**Purpose**: Generates Android proxy configurations

**Key functionality**:
- Creates proxy configuration files compatible with HTTP Toolkit
- Filters traffic to only capture Idle Heroes data
- Integrates authentication tokens for security
- Configures lightweight monitoring with minimal overhead
- Includes detailed setup instructions
- Provides compatibility across Android versions
- Ensures minimal battery and performance impact

#### `tools/image_utility.py`

**Purpose**: Downloads and optimizes game images

**Key functionality**:
- Retrieves official Idle Heroes images from source
- Optimizes images for web use (size, quality, format)
- Creates variants (regular and dark) for backgrounds
- Generates a manifest of all available images
- Implements security verification for official usage
- Handles error recovery for network issues

### GitHub Workflows

#### `.github/workflows/idle-heroes-workflow.yml`

**Purpose**: Main CI/CD pipeline for the application

**Key functionality**:
- Runs security checks on codebase
- Builds iOS and Android profiles with secure tokens
- Processes and optimizes game images
- Creates GitHub releases with versioned profiles
- Deploys the application to GitHub Pages
- Updates profile download links to the latest version
- Schedules regular maintenance builds

#### `.github/workflows/account-data-updater.yml`

**Purpose**: Manages account data updates for permanent links

**Key functionality**:
- Receives account data updates (10 bytes) when users play
- Validates data format and structure
- Updates account-specific JSON files in the repository
- Maintains an update log for tracking purposes
- Handles data integrity verification
- Ensures permanent account links always show the latest data

### Service Worker

#### `service-worker.js`

**Purpose**: Enables offline functionality

**Key functionality**:
- Caches application assets for offline use
- Implements cache-first strategy for assets
- Provides fallback content when offline
- Handles cache versioning and updates
- Manages background synchronization
- Optimizes performance through precaching
- Enables progressive web app functionality

## Conclusion

The Idle Heroes Account Viewer represents a comprehensive solution for secure, private account data viewing and sharing. By combining client-side technologies with secure GitHub-based build processes, it achieves the dual goals of complete transparency (open source) and secure authentication (profiles can only be built by the official repository).

The permanent account URL system (`/account/Platform=UID`) ensures users only need to share their link once, while the tiny data updates (approximately 10 bytes) guarantee that shared links always display the most current account information.
