# Testing Guide for Zotero ODF Scan Plugin (Version 3.0)

This document provides comprehensive testing instructions for the Zotero 7-compatible ODF Scan plugin.

## Prerequisites

- Zotero 7.0 or later installed
- LibreOffice or OpenOffice for creating and viewing ODF documents
- Test ODF documents (instructions provided below)

## Test 1: Plugin Installation and Basic Functionality

### Objective
Verify that the plugin installs correctly in Zotero 7 and basic UI elements are accessible.

### Steps

1. **Build the XPI**
   ```bash
   python3 build.py
   ```
   This should create a file named `zotero-odf-scan-v3.0.0.xpi` (or similar based on version).

2. **Install the Plugin**
   - Open Zotero 7
   - Go to Tools > Add-ons
   - Click the gear icon and select "Install Add-on From File..."
   - Navigate to and select the `zotero-odf-scan-v3.0.0.xpi` file
   - Click "Install Now" when prompted

3. **Verify Installation**
   - The plugin should appear in the Add-ons list as "ODF Scan for Zotero"
   - Version should show as "3.0.0"
   - No error messages should appear in the Zotero console (Help > Run JavaScript > Error Console)

4. **Verify Menu Item**
   - Click on Tools menu in Zotero main window
   - Verify "ODF Scan" menu item appears in the Tools menu
   - The menu item should be enabled (not grayed out)

5. **Verify Dialog Opens**
   - Click Tools > ODF Scan
   - The ODF Scan wizard dialog should open
   - Dialog should display the intro page with:
     - File type radio buttons (ODF or ODT)
     - Input file path field with "Choose File" button
     - Output file path field with "Choose File" button
     - Navigation buttons (Next should be visible, Back should be disabled)

6. **Test Dialog Navigation**
   - Initially, the Next button should be disabled (no files selected yet)
   - Close the dialog using the close button (X) or Cancel
   - Reopen the dialog to ensure it can be launched multiple times

### Expected Results
- Plugin installs without errors
- Menu item appears in Tools menu
- Dialog opens and displays correctly
- All UI elements are visible and properly styled
- No JavaScript errors in the console

---

## Test 2: ODF to Citations Conversion

### Objective
Verify that the plugin correctly converts scannable cite markers to Zotero reference marks in ODF documents.

### Test Preparation

1. **Create Test ODF Document**
   - Open LibreOffice Writer
   - Create a new document with the following content:

   ```
   Test Document for Scannable Cite Conversion

   Basic citation: { | Smith, 2020 | | |zu:12345:ABCDEF }

   Citation with prefix: { Prefix text | Jones, 2019 | | |zu:12345:GHIJKL }

   Citation with suffix: { | Brown, 2018 | |suffix text |zu:12345:MNOPQR }

   Citation with locator: { | Davis, 2021 | |p. 45 |zu:12345:STUVWX }

   Suppress author citation: { - | Wilson, 2017 | | |zu:12345:YZABCD }

   Combined citation: { Prefix | Johnson, 2020 | |p. 12, suffix |zu:12345:EFGHIJ }

   Multiple citations in one marker: { | Smith, 2020; Jones, 2019; Brown, 2018 | | |zu:12345:MULTI1 }
   ```

   Note: Replace the `zu:12345:ABCDEF` style codes with actual Zotero item keys from your library, or create test items first.

2. **Save the document**
   - File > Save As
   - Choose "ODF Text Document (.odt)" format
   - Save as "test-input-citations.odt"

### Testing Steps

1. **Open ODF Scan Dialog**
   - In Zotero, click Tools > ODF Scan
   - Ensure "ODF" or "ODT" is selected (depending on your test file)

2. **Select Input File**
   - Click "Choose File" next to Input file field
   - Select your "test-input-citations.odt" file
   - The file path should appear in the input field

3. **Select Output Location**
   - Click "Choose File" next to Output file field
   - Choose a location and name for the output file (e.g., "test-output-citations.odt")
   - The file path should appear in the output field

4. **Run Conversion**
   - The "Next" button should now be enabled
   - Click "Next"
   - The wizard should advance to the scan page
   - A progress indicator should appear
   - Wait for the conversion to complete

5. **Verify Completion**
   - The wizard should advance to the completion page
   - A success message should be displayed
   - Click "Finish" to close the dialog

6. **Verify Output File**
   - Open the output file (test-output-citations.odt) in LibreOffice
   - Each scannable cite marker should be replaced with a Zotero reference mark
   - The reference marks should appear as gray background fields in LibreOffice
   - Right-click on a reference mark and select "Fields > Edit Field" to verify:
     - The field type should be "ReferenceMarks"
     - The field name should contain JSON data with citation information

7. **Verify Citation Metadata**
   - For each converted citation, verify the following metadata is preserved:
     - **Basic citation**: Should have author and year
     - **Citation with prefix**: Should include prefix text before citation
     - **Citation with suffix**: Should include suffix text after citation
     - **Citation with locator**: Should include page number (p. 45)
     - **Suppress author**: Should show year only, no author name
     - **Combined citation**: Should have prefix, locator, and suffix all present
     - **Multiple citations**: All cited items should be included

### Expected Results
- All scannable cite markers are converted to Zotero reference marks
- Reference marks contain valid JSON data
- All citation metadata (prefix, suffix, locator, suppress-author) is preserved
- Document formatting remains intact
- File opens correctly in LibreOffice without errors

### Troubleshooting
- If conversion fails, check the Zotero debug output (Help > Debug Output Logging)
- Verify that the Zotero item keys in your test document exist in your library
- Ensure the ODF document is valid (can be opened in LibreOffice without errors)

---

## Test 3: ODF to Markers Conversion (Reverse Direction)

### Objective
Verify that the plugin correctly converts Zotero reference marks back to scannable cite markers.

### Test Preparation

1. **Use Output from Test 2**
   - Use the output file from Test 2 (test-output-citations.odt) as input
   - This file should contain Zotero reference marks

2. **Alternative: Create Manual Test Document**
   - Open LibreOffice Writer
   - Create a new document with some text
   - Use Insert > Field > More Fields > References tab
   - Create reference mark fields manually with JSON content
   - Note: This method is more complex and Test 2 output is recommended

### Testing Steps

1. **Open ODF Scan Dialog**
   - In Zotero, click Tools > ODF Scan
   - Select "ODF" or "ODT" file type

2. **Select Input File**
   - Click "Choose File" next to Input file field
   - Select the file with Zotero reference marks (e.g., test-output-citations.odt)
   - The file path should appear in the input field

3. **Select Output Location**
   - Click "Choose File" next to Output file field
   - Choose a location and name for the output file (e.g., "test-reverse-markers.odt")
   - The file path should appear in the output field

4. **Run Reverse Conversion**
   - Click "Next"
   - Wait for the conversion to complete
   - The scan page should show progress

5. **Verify Completion**
   - The wizard should advance to the completion page
   - Click "Finish" to close the dialog

6. **Verify Output File**
   - Open the output file (test-reverse-markers.odt) in LibreOffice
   - Each Zotero reference mark should be converted back to scannable cite format
   - The markers should be visible as plain text in the format:
     ```
     { prefix | author, year | |locator, suffix |itemKey }
     ```

7. **Verify Round-Trip Accuracy**
   - Compare the output with your original test document from Test 2 preparation
   - All citation metadata should be preserved:
     - Prefixes should match original
     - Suffixes should match original
     - Locators (page numbers, etc.) should match original
     - Suppress-author flag should be preserved (shown as "{ - |" if present)
     - Item keys should be intact

8. **Test Complete Round-Trip**
   - Take the reverse-converted file (test-reverse-markers.odt)
   - Run it through Test 2 again (markers to citations)
   - Compare the final result with the original Test 2 output
   - They should be functionally identical

### Expected Results
- All Zotero reference marks are converted back to scannable cite markers
- All citation metadata is preserved (prefix, suffix, locator, suppress-author)
- Marker format is correct and parseable
- Document formatting remains intact
- Round-trip conversion (markers > citations > markers) produces consistent results

### Troubleshooting
- If reference marks are not detected, verify they contain valid JSON data
- Check that the reference mark field names follow the expected format
- Verify the document contains actual reference mark fields, not just styled text

---

## Test 4: Error Handling and Edge Cases

### Additional Testing Scenarios

1. **Empty Input File**
   - Test with a blank ODF document
   - Should complete without errors
   - Output should be identical to input

2. **Invalid File Type**
   - Try to select a non-ODF file (e.g., .docx or .txt)
   - Should display an error message
   - Should not allow proceeding with conversion

3. **Invalid Citation Markers**
   - Create a document with malformed markers (missing pipes, incorrect format)
   - Should skip invalid markers or show warning
   - Should continue processing valid markers

4. **File Path Issues**
   - Try selecting an output path in a read-only directory
   - Should display an error message
   - Try overwriting an existing file (should prompt for confirmation or overwrite)

5. **Large Documents**
   - Test with a document containing 50+ citations
   - Conversion should complete without timeout
   - All citations should be processed

6. **Special Characters**
   - Test with citations containing Unicode characters (e.g., accented names)
   - Test with quotation marks in prefix/suffix
   - All special characters should be preserved

---

## Post-Testing Checklist

After completing all tests:

- [ ] Plugin installs without errors
- [ ] Menu item appears and is functional
- [ ] Dialog opens and navigates correctly
- [ ] Citations convert correctly (markers to Zotero fields)
- [ ] Reverse conversion works (Zotero fields to markers)
- [ ] Round-trip conversion preserves all metadata
- [ ] Error handling works for invalid inputs
- [ ] No console errors during any operations
- [ ] Document formatting is preserved in all conversions
- [ ] LibreOffice can open all output files without errors

---

## Reporting Issues

If you encounter any issues during testing:

1. **Collect Information**
   - Zotero version (Help > About Zotero)
   - Plugin version (Tools > Add-ons)
   - Error messages from console (Help > Run JavaScript > Error Console)
   - Debug output (Help > Debug Output Logging)

2. **Document the Issue**
   - Describe the steps to reproduce
   - Include any error messages
   - Attach sample files if possible (or describe the content)

3. **Submit to GitHub**
   - Create an issue at: https://github.com/Juris-M/zotero-odf-scan-plugin/issues
   - Include all collected information
   - Label with "Zotero 7" tag if applicable

---

## Notes

- This plugin is specifically designed for Zotero 7.x
- For Zotero 6 compatibility, use version 2.x of the plugin
- ODF format (.odt) is recommended over legacy RTF format
- Always keep backups of important documents before conversion
