# Technology Stack

## Project Type

Zotero Plugin - A browser-style extension (add-on) for the Zotero reference manager desktop application. The plugin extends Zotero's functionality using Mozilla's legacy extension architecture (XUL/XPCOM) and is being migrated to the modern Zotero 7 architecture (XHTML/WebExtension-style).

## Core Technologies

### Primary Language(s)
- **Language**: JavaScript (ES6+)
- **Runtime**: Mozilla Gecko engine (Firefox-based) embedded in Zotero
- **No transpilation**: Currently plain JavaScript, no TypeScript or build-time compilation

### Key Dependencies/Libraries

**Runtime Dependencies:**
- **Zotero APIs**: Core application APIs for items, preferences, file handling, translators
- **Mozilla XPCOM**: Component Object Model for system services (being deprecated in Z7)
- **Services.jsm**: Mozilla services module for window management, preferences

**Development Dependencies:**
- **ESLint 5.9.0**: JavaScript linting
- **eslint-plugin-local**: Custom lint rules

**Zotero 7 Migration Dependencies (planned):**
- **zotero-plugin-toolkit**: Helper utilities for Z7 plugin development
- **zotero-plugin-scaffold**: Build tooling for modern Zotero plugins
- **JSZip**: JavaScript ZIP library to replace XPCOM zip handling

### Application Architecture

**Plugin Architecture Pattern**: Bootstrap Extension
- Self-contained addon with lifecycle hooks (install, startup, shutdown, uninstall)
- No chrome.manifest registration in Z7 (handled by bootstrap.js)
- Direct DOM manipulation for UI injection

**Core Components:**
1. **bootstrap.js**: Plugin lifecycle management, menu registration, translator installation
2. **rtfScan.js**: Main conversion logic (~1,270 lines), wizard UI controller
3. **rtfScan.xul**: Wizard UI definition (XUL → needs XHTML conversion)
4. **Scannable Cite.js**: Export translator for generating citation markers

**Data Flow:**
```
User selects file → Read ZIP (ODF) → Parse XML content →
Regex-based citation detection → Convert markers ↔ references →
Write modified ZIP → Output file
```

### Data Storage (if applicable)
- **Primary storage**: File system (ODF/RTF files)
- **Preferences**: Zotero.Prefs (Mozilla preferences system)
- **No database**: Plugin doesn't maintain its own database; uses Zotero's item database for lookups

### Data Formats
- **ODF files**: ZIP archives containing XML (content.xml, meta.xml)
- **RTF files**: Plain text with RTF markup
- **Citation markers**: Custom text format `{prefix | citation | locator | suffix | key}`
- **Zotero references**: XML reference marks with JSON-encoded citation data

### External Integrations (if applicable)
- **Zotero Item Database**: Lookups for citation matching
- **Zotero Translators**: Uses translator framework for Scannable Cite export
- **File System**: Local file read/write for document processing

## Development Environment

### Build & Development Tools
- **Build System**: Python script (`build.py`) for XPI packaging
- **Package Management**: npm for dev dependencies
- **No watch mode**: Manual rebuild required

### Code Quality Tools
- **Static Analysis**: ESLint with custom local plugin
- **Formatting**: ESLint auto-fix
- **Testing Framework**: None currently (manual testing only)
- **Documentation**: Inline JSDoc comments

### Version Control & Collaboration
- **VCS**: Git
- **Branching Strategy**: Feature branches, master as main branch
- **Current Branch**: `zotero7` for Z7 migration work

## Deployment & Distribution
- **Target Platform(s)**: Zotero 7.x desktop application (Windows, macOS, Linux)
- **Distribution Method**: XPI file download, manual installation
- **Installation**: Zotero Add-ons Manager (Tools → Add-ons → Install from file)
- **Update Mechanism**: Zotero's update.json/update.rdf system

## Technical Requirements & Constraints

### Performance Requirements
- Handle typical academic documents (10-500 citations) without noticeable delay
- File processing should complete within seconds for normal documents
- Regex-based parsing must handle malformed/complex citation strings

### Compatibility Requirements
- **Platform Support**: Zotero 7.0 - 7.999 (strict_min/max in manifest.json)
- **Juris-M Support**: Compatible with Juris-M legal citation variant
- **ODF Support**: LibreOffice/OpenOffice ODT files
- **RTF Support**: Legacy RTF file format

### Security & Compliance
- **File Access**: Read/write to user-selected files only
- **No Network**: Plugin operates entirely offline
- **Data Privacy**: No telemetry or external data transmission

## Technical Decisions & Rationale

### Decision Log

1. **Minimal Migration (Option B)**: Keep JavaScript, simple build, convert XUL to XHTML manually
   - **Rationale**: Faster path to working Z7 plugin, less risk
   - **Trade-off**: Technical debt, no TypeScript benefits

2. **JSZip for ZIP Handling**: Replace XPCOM nsIZipReader/nsIZipWriter
   - **Rationale**: XPCOM ZIP APIs deprecated in Z7
   - **Alternative considered**: Zotero's built-in file APIs (insufficient for ZIP manipulation)

3. **Wizard UI Pattern**: Multi-step dialog for conversion workflow
   - **Rationale**: Guides users through file selection, scan, optional citation mapping
   - **Challenge**: XUL `<wizard>` has no HTML equivalent, needs custom implementation

4. **Regex-based Parsing**: Citation detection via regular expressions
   - **Rationale**: Flexible handling of various marker formats
   - **Limitation**: Complex regex patterns are fragile, hard to debug

## Known Limitations

1. **No TypeScript**: Lack of type safety, harder to maintain and refactor
   - *Potential solution*: Future migration to zotero-plugin-scaffold with TypeScript

2. **No Automated Tests**: All testing is manual
   - *Impact*: Risk of regressions during Z7 migration
   - *Potential solution*: Add Jest/Mocha tests for core conversion logic

3. **XPCOM Dependencies**: Current code uses deprecated Mozilla APIs
   - *Impact*: Blocking issue for Z7 compatibility
   - *Solution*: Replace with modern JavaScript equivalents (JSZip, fetch, etc.)

4. **XUL UI**: Entire wizard UI needs rewriting for Z7
   - *Impact*: Significant effort required
   - *Solution*: Convert to XHTML with custom wizard-like step navigation

5. **Complex Regex Patterns**: Citation parsing uses many complex regex patterns
   - *Impact*: Difficult to debug, potential edge case failures
   - *Potential solution*: Consider structured parser for future versions
