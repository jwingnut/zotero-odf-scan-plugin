# Zotero ODF Scan Plugin

A Zotero plugin for converting between scannable cite markers and Zotero citations in ODF (Open Document Format) files.

## Version 3.0 - Zotero 7 Compatible

**This version (3.0+) is compatible with Zotero 7.x only.**

For Zotero 6.x, please use version 2.x from the master branch.

## Features

- Convert ODF documents with scannable cite markers to Zotero citations
- Reverse conversion: Convert Zotero citations back to scannable markers
- Preserves citation metadata (prefixes, suffixes, locators, suppress-author flags)
- Native Zotero 7 integration with modern UI

## Requirements

- Zotero 7.0 or later
- Python 3.7+ (for building from source)
- Node.js 8+ (for development)

## Installation

### From Release

1. Download the latest `.xpi` file from the [Releases page](https://github.com/Juris-M/zotero-odf-scan-plugin/releases)
2. In Zotero, go to Tools > Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file
5. Restart Zotero

### From Source

1. Clone this repository
2. Install build dependencies:
   ```bash
   pip3 install -r requirements.txt
   npm install
   ```
3. Build the XPI:
   ```bash
   python3 build.py
   ```
4. Install the generated `.xpi` file in Zotero (see "From Release" steps above)

## Usage

1. In Zotero, click Tools > ODF Scan
2. Select your input ODF file (with scannable cite markers or Zotero citations)
3. Choose an output location
4. Click Next to start the conversion
5. Open the output file in LibreOffice or your preferred ODF editor

For detailed testing instructions and examples, see [TESTING.md](TESTING.md).

## Building

The build requires python 3.7 and node 8+. Before running build, you must prepare the build environment once by running

```bash
pip3 install -r requirements.txt
npm install
```

After this, `build.py` rebuilds the XPI. Without parameters it just grabs the sources and zips them up. If you pass --release, it will also update update.rdf

The build uses npm for version management. `npm version` manages versions nicely and also checks you're not bumping versions while your working dir is dirty. It also stores the version number in package.json, where build.py picks it up.

`npm version` will automatically run `build.py` after bumping.

## Migration from Zotero 6

Version 3.0 represents a complete rewrite for Zotero 7 compatibility:

- Migrated from XUL to XHTML for UI
- Replaced deprecated XPCOM APIs with modern alternatives
- Updated to use Fluent localization system
- New bootstrap and manifest structure

**Breaking Changes:**
- Minimum Zotero version: 7.0
- No backward compatibility with Zotero 6.x (use version 2.x for Zotero 6)

## Development

For development and testing:

```bash
npm test          # Run ESLint checks
python3 build.py  # Build XPI package
```

## License

See [COPYING.txt](COPYING.txt) for license information.

## Contributing

Issues and pull requests are welcome on GitHub: https://github.com/Juris-M/zotero-odf-scan-plugin

