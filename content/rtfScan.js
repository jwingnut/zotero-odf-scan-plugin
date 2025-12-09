/*
    ***** BEGIN LICENSE BLOCK *****

    Copyright © 2009 Center for History and New Media
                     George Mason University, Fairfax, Virginia, USA
                     http://zotero.org

    This file is part of Zotero.

    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

    ***** END LICENSE BLOCK *****
*/

/**
 * @fileOverview ODF Scan Dialog - Conversion Logic
 * Migrated for Zotero 7 XHTML dialogs
 */

 try {
    // Zotero 6+
    var FilePicker = require('zotero/modules/filePicker').default;
}
catch (e) {
    // Zotero 5 (fallback)
    var FilePicker = require('zotero/filePicker').default;
}

/**
 * Dialog controller for ODF Scan wizard
 * @namespace
 */
var Zotero_ODFScan = new function() {
    let inputFile = null, outputFile = null;

    // Use the new getString helper from Zotero.ODFScan
    function getString(key, params) {
        return Zotero.ODFScan.getString(key, params);
    }

    // Get WizardController reference (will be set on init)
    let WizardController = null;

    /**
     * Initialize the dialog
     * Called when dialog loads
     */
    this.init = function() {
        Zotero.debug('[ODF Scan Dialog] Initializing');

        // Get WizardController reference
        WizardController = Zotero.ODFScan.WizardController;

        // Set up wizard navigation button handlers
        document.getElementById('back-button').addEventListener('click', function() {
            WizardController.rewind();
        });

        document.getElementById('next-button').addEventListener('click', function() {
            Zotero_ODFScan.advance();
        });

        document.getElementById('finish-button').addEventListener('click', function() {
            window.close();
        });

        document.getElementById('cancel-button').addEventListener('click', function() {
            window.close();
        });

        // Initialize the intro page
        this.introPageShowing();

        // Update button states
        WizardController.updateButtons();
    };

    /**
     * Called when advancing from a page
     * Handles page-specific advance logic
     */
    this.advance = function() {
        const currentPage = WizardController.currentPage;

        if (currentPage === 'intro') {
            this.introPageAdvanced();
            WizardController.advance();
            this.scanPageShowing();
        } else if (currentPage === 'scan') {
            // Scan page advances automatically after processing
            WizardController.advance();
        }
    };

    /** INTRO PAGE UI **/

    /**
   * Called when the first page is shown; loads target file from preference, if one is set
   */
    this.introPageShowing = function() {
        let fileType = Zotero.Prefs.get("ODFScan.fileType");
        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        let mode_string = [fileType];
        if (outputMode) {
            mode_string.push(outputMode);
        }
        mode_string = mode_string.join("-");
        let selectedNode = document.getElementById("file-type-selector-" + mode_string);

        if (selectedNode) {
            selectedNode.checked = true;
            this.fileTypeSwitch(selectedNode.value);
        }

        document.getElementById("choose-input-file").focus();
    };

    /**
   * Called when the first page is hidden
   */
    this.introPageAdvanced = function() {
    // get file type
        let fileType = Zotero.Prefs.get("ODFScan.fileType");
        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        Zotero.Prefs.set("ODFScan."+fileType+".lastInputFile" + outputMode, inputFile.path);
        Zotero.Prefs.set("ODFScan."+fileType+".lastOutputFile" + outputMode, outputFile.path);
    };

    /**
   * Called to select the file to be processed
   */
    this.chooseInputFile = async function () {
    // Hide any error message
        let errorMsg = document.getElementById("odf-file-error-message");
        if (errorMsg) {
            errorMsg.style.display = "none";
        }

        // get file type
        let fileType = Zotero.Prefs.get("ODFScan.fileType");
        // display file picker
        let fp = new FilePicker();
        fp.init(window, getString("odf-scan-open-title"), fp.modeOpen);

        let fileExt = fileType;
        if (fileType === "odf") {
            fileExt = "odt";
        } else {
            fp.appendFilters(fp.filterAll);
        }
        fp.appendFilter(getString("odf-scan-file-type-" + fileType), "*." + fileExt);

        // Set directory if possible
        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        let inputPath = Zotero.Prefs.get("ODFScan."+fileType+".lastInputFile" + outputMode);
        if (inputPath) {
            if (!inputFile) {
                inputFile = Zotero.File.pathToFile(inputPath);
            }
            fp.displayDirectory = inputFile.parent;
        }

        let rv = await fp.show();
        if (rv == fp.returnOK || rv == fp.returnReplace) {
            inputFile = Zotero.File.pathToFile(fp.file);
            _updatePath();
        }
    };

    /**
   * Called to select the output file
   */
    this.chooseOutputFile = async function() {
        let fileType = Zotero.Prefs.get("ODFScan.fileType");
        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        let fileExt = fileType;
        if (fileType === "odf") {
            fileExt = "odt";
        }
        let fp = new FilePicker();
        fp.init(window, getString("odf-scan-save-title"), fp.modeSave);
        fp.appendFilter(getString("odf-scan-file-type-" + fileType), "*." + fileExt);
        if (inputFile) {
            let leafName = inputFile.leafName;
            let dotIndex = leafName.lastIndexOf(".");
            if (dotIndex != -1) {
                leafName = leafName.substr(0, dotIndex);
            }
            let suffix = (" " + getString("odf-scan-" + fileType + "-scanned-file-suffix-" + outputMode.replace("to", "to-")));
            if (fileType === "odf") {
                let suffixMatchers = [
                    " " + getString("odf-scan-odf-scanned-file-suffix-to-markers"),
                    " " + getString("odf-scan-odf-scanned-file-suffix-to-citations")
                ];
                for (let suffixMatcher of suffixMatchers) {
                    if (leafName.slice(-suffixMatcher.length, leafName.length) == suffixMatcher) {
                        leafName = leafName.slice(0, -suffixMatcher.length);
                    }
                }
            }
            fp.defaultString = leafName + suffix + "." + fileExt;
        } else {
            fp.defaultString = "Untitled." + fileExt;
        }

        // Set directory if possible
        outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        let outputPath = Zotero.Prefs.get("ODFScan."+fileType+".lastOutputFile" + outputMode);
        if (outputPath) {
            if (!outputFile) {
                outputFile = Zotero.File.pathToFile(outputPath);
            }
            fp.displayDirectory = outputFile.parent;
        }

        let rv = await fp.show();
        if (rv == fp.returnOK || rv == fp.returnReplace) {
            outputFile = Zotero.File.pathToFile(fp.file);
            _updatePath();
        }
    };

    /**
   * Called to update the path label in the dialog box
   * @private
   */
    function _updatePath() {
        WizardController.setCanAdvance(inputFile && outputFile);

        if (inputFile && inputFile.path) {
            document.getElementById("input-path").value = inputFile.path;
            document.getElementById("choose-output-file").disabled = false;
        } else {
            document.getElementById("input-path").value = getString("odf-scan-file-none-selected-label");
            document.getElementById("choose-output-file").disabled = true;
        }

        if (outputFile) {
            document.getElementById("output-path").value = outputFile.path;
        } else {
            document.getElementById("output-path").value = getString("odf-scan-file-none-selected-label");
        }
    }

    /**
   * Called to refresh the path label in the dialog box when switching modes
   * @private
   */
    function _refreshPath() {
        let fileType = Zotero.Prefs.get("ODFScan.fileType");
        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");
        let inputPath = Zotero.Prefs.get("ODFScan."+fileType+".lastInputFile" + outputMode);
        if (inputPath) {
            document.getElementById("input-path").value = inputPath;
            inputFile = Zotero.File.pathToFile(inputPath);
        } else {
            inputFile = null;
            document.getElementById("input-path").value = getString("odf-scan-file-none-selected-label");
        }
        outputFile = null;
        _updatePath();
    }

    /** SCAN PAGE UI **/

    /**
   * Called when second page is shown.
   */
    this.scanPageShowing = function() {
    // can't advance
        WizardController.setCanAdvance(false);

        let outputMode = Zotero.Prefs.get("ODFScan.outputMode");

        let errorMsg = document.getElementById("odf-file-error-message");
        if (errorMsg) {
            errorMsg.style.display = "none";
        }

        // wait a ms so that UI thread gets updated
		window.setTimeout(function() { _scanODF(outputMode); }, 1);
    };

    /**
   * s = "Why do we do this entirely in SQL? Because we're crazy. Crazy like foxes."
   * s.replace(/in SQL/, "with regular expressions");
   */
    async function _scanODF(outputMode) {
        let reverse_conversion = false;
        if (outputMode === "tomarkers") {
            reverse_conversion = true;
        }
        // when scanning is complete, go to citations page
        WizardController.setCanAdvance(false);

        let tmplCitation = "<text:reference-mark-start text:name=\"ZOTERO_ITEM {&quot;properties&quot;:{&quot;formattedCitation&quot;:&quot;%{1}s&quot;},&quot;citationItems&quot;:%{2}s} RND%{3}s\"/>%{4}s<text:reference-mark-end text:name=\"ZOTERO_ITEM {&quot;properties&quot;:{&quot;formattedCitation&quot;:&quot;%{5}s&quot;},&quot;citationItems&quot;:%{6}s} RND%{7}s\"/>";
        let tmplText = "{ %{1}s | %{2}s | %{3}s | %{4}s |%{5}s}";

        let rexPref = /<meta:user-defined meta:name="ZOTERO_PREF[^<]*?<\/meta:user-defined>/;
        let rexLabels = /^((?:art|ch|Ch|subch|col|fig|l|n|no|op|p|pp|para|subpara|pt|r|sec|subsec|Sec|sv|sch|tit|vrs|vol)\\.)\\s+(.*)/;
        let rexBalancedTags = /(.*)<([-:a-zA-Z0-9]*)[^\/>]*>([^<]*)<\/([-:a-zA-Z0-9]*)[^>]*>(.*)/;
        let rexLink = /(<[^>]*xlink:href=\"([^\"]*)\"[^>]*>)\s*{([^\|{}]*)\|([^\|}]*)\|([^\|}]*)\|([^\|}]*)}\s*(<[^>]*>)/;
        let rexLink2 = /(<[^>]*xlink:href=\"([^\"]*)\"[^>]*>)\s*(?:<[^\/>]+>)\s*{([^\|{}]*)\|([^\|}]*)\|([^\|}]*)\|([^\|}]*)}\s*(?:<\/[^\/>]+>)\s*(<[^>]*>)/;
        let rexNativeLink = /<text:reference-mark-start[^>]*ZOTERO_ITEM\s+(?:CSL_CITATION\s+)*([^>]*)\s+[^ ]*\/>(.*?)<text:reference-mark-end[^>]*\/>/;
        let checkStringRex = /(<[^\/>][^>]*>)*{[^<>\|]*|[^<>\|]*|[^<>\|]*|[^<>\|]*|[^<>\|]*}(<\/[^>]*>)*/;
        let openTagSplitter = /(<[^\/>][^>]*>)/;
        let closeTagSplitter = /(<\/[^>]*>)/;
        let rexSingleton = /<[^>]*\/>/g;
        let rexSpace = /<text:s\/>/g;
        let rexPlainTextLinks = /({[^\|{}]*\|[^\|}]*\|[^\|}]*\|[^\|}]*\|[^\|}]*})/;
        let rexWrappedLinks = /(<[^>]*xlink:href=\"[^\"]*\"[^>]*>\s*(?:<[^\/>]+>)?\s*{[^\|{}]*\|[^\|}]*\|[^\|}]*\|[^\|}]*}\s*(?:<\/[^\/>]+>)?\s*<[^>]*>)/;
        let rexNativeLinks = /(<text:reference-mark-start[^>]*ZOTERO_ITEM\s+(?:CSL_CITATION\s+)*[^>]*\/>.*?<text:reference-mark-end[^>]*\/>)/;
        let rexCite = /({[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*})/;
        let rexCiteExtended = /(<\/?text:span[^>]*>{[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*}<\/?text:span[^>]*>)/;
        let rexCiteExtendedParts = /(<text:span[^>]*>)({[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*})(<\/text:span>)/;
        let rexCiteExtendedPartsReverse = /(<\/text:span>)({[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*\|[^<>\|]*})(<text:span[^>]*>)/;

        let rexFixMarkupBold = /[\*][\*](.*?)[\*][\*]/;
        let rexFixMarkupItalic = /\*(.*?)\*/;

        let rexTextAll = /{\s*([^|{}]*)\|\s*([^|}]*)\s*\|\s*([^|}]*)\s*\|([^|}]*?)\s*\|\s*([^|}]*)\s*}/g;
        let rexText = /{\s*([^|{}]*)\|\s*([^|}]*)\s*\|\s*([^|}]*)\s*\|([^|}]*?)\s*\|\s*([^|}]*)\s*}/;
        let rexTextPlain = /{[^|{}]*\|[^|}]*\|[^|}]*\|[^|}]*\|[^|}]*}/;
        let rexEmptyBalanceSpan = /^<text:span[^>]*><\/text:span[^>]*>$/;

        let labels = {article: "art",
            chapter: "ch",
            Chapter: "Ch",
            subchapter: "subch",
            column: "col",
            figure: "fig",
            line: "l",
            note: "n",
            issue: "no",
            opus: "op",
            // page: "p",
            page: "pp",
            paragraph: "para",
            subparagraph: "subpara",
            part: "pt",
            rule: "r",
            section: "sec",
            subsection: "subsec",
            Section: "Sec",
            "sub-verbo": "sv",
            schedule: "sch",
            title: "tit",
            verse: "vrs",
            volume: "vol"
        };

        let Fragment = function(txt) {
            this.txt = txt;
            this.newtxt = txt;
        };

        Fragment.prototype.removeBalancedTags = function (str) {
            while (true) {
                let m = str.match(rexBalancedTags);
                if (m) {
                    if (m[2] === m[4]) {
                        str = str.replace(rexBalancedTags, "$1$3$5");
                    } else {
                        // If tags are mismatched the file is corrupt.
                        // Do not make the situation worse.
                        throw "Mismatched tags: "+m[2]+" "+m[4]+". Original document is corrupt. Aborting.";
                    }
                } else {
                    break;
                }
            }
            return str;
        };

        Fragment.prototype.normalizeStringMarks = function() {
            // Normalize intended rexText entries
            //  replace XML space with space
            this.newtxt = this.newtxt.replace(rexSpace, " ");
            // replace other singletons with empty string
            this.newtxt = this.newtxt.replace(rexSingleton, "");
            // remove balanced braces
            this.newtxt = this.removeBalancedTags(this.newtxt);
            // move open tags to the end
            let newlst = [];
            let lst = this.newtxt.split(openTagSplitter);
            for (let i=0,ilen=lst.length;i<ilen;i+=2) {
                newlst.push(lst[i]);
            }
            for (let i=1,ilen=lst.length;i<ilen;i+=2) {
                newlst.push(lst[i]);
            }
            this.newtxt = newlst.join("");
            // move close tags to the front
            newlst = [];
            lst = this.newtxt.split(closeTagSplitter);
            for (let i=1,ilen=lst.length;i<ilen;i+=2) {
                newlst.push(lst[i]);
            }
            for (let i=0,ilen=lst.length;i<ilen;i+=2) {
                newlst.push(lst[i]);
            }
            this.newtxt = newlst.join("");
        };

        Fragment.prototype.normalizeLinkedMarks = function () {
            this.newtxt = this.newtxt.replace(rexLink, "{$1$3|$4|$5|$6|$2$7}");
            this.newtxt = this.newtxt.replace(rexLink2, "{$1$3|$4|$5|$6|$2$7}");
        };

        Fragment.prototype.normalizeNativeMarks = function () {
            // Normalize all rexNative entries to rexText
            let m = this.newtxt.match(rexNativeLink);
            if (m) {
                let m_citation = m[1];
                let m_plaintext = this.removeBalancedTags(m[2]);
                let replacement = "";
                let obj_txt = m_citation.split("&quot;").join("\"");
                let obj = JSON.parse(obj_txt);
                let count = 1;
                for (let i=0,ilen=obj.citationItems.length;i<ilen;i+=1) {
                    let item = obj.citationItems[i];
                    if (i === 0 && item["suppress-author"]) {
                        m_plaintext = "-" + m_plaintext;
                    }
                    let isUser = false;
                    // Zotero 6+ has only item.uris
                    if ((item.uri && item.uri.length) || (item.uris && item.uris.length)) {
                        // if has uri, get value, identify as user or group, and fashion zotero://select ref
                        let uri = item.uri;
                        if (!uri) {
                            uri = item.uris
                        }
                        let key = [];
                        let m_uri = false;
                        if ("object" === typeof uri) {
                            for (let u of uri) {
                                if (u) {
                                    m_uri = u.match(/\/(users|groups)\/([0-9]+|local(?:\/[^/]+)?)\/items\/(.+)/);
                                    if (m_uri) {
                                        break;
                                    }
                                }
                            }
                        }
                        if (m_uri) {
                            if (m_uri[1] === "users") {
                                isUser = true;
                                // Here is where the information loss from using zotero://select shines through.
                                if (m_uri[2].includes("local") || Zotero.Prefs.get("translators.ODFScan.useZoteroSelect")) {
                                    key.push("0");
                                } else {
                                    key.push(m_uri[2]);
                                }
                            } else {
                                let libID;
                                if (Zotero.Prefs.get("translators.ODFScan.useZoteroSelect")) {
                                    libID = Zotero.Groups.getLibraryIDFromGroupID(m_uri[2]);
                                } else {
                                    libID = m_uri[2];
                                }
                                key.push(libID);
                            }
                            key.push(m_uri[3]);
                            if (Zotero.Prefs.get("translators.ODFScan.useZoteroSelect")) {
                                item.key = key.join("_");
                            } else {
                                item.key = key.join(":");
                            }
                        }
                    } else {
                        // if no uri, assume user library
                        // (shouldn't really be doing this on item, the semantics differ; but
                        // we throw the item object away, so no harm done)
                        // (In any case, we should not reach this.)
                        isUser = true;
                        if (Zotero.Prefs.get("translators.ODFScan.useZoteroSelect")) {
                            item.key = "0_" + item.key;
                        } else {
                            item.key = "0:" + item.key;
                        }
                    }
                    if (Zotero.Prefs.get("translators.ODFScan.useZoteroSelect")) {
                        item.key = "zotero://select/items/" + item.key;
                    } else if (isUser) {
                        item.key = "zu:" + item.key;
                    } else {
                        item.key = "zg:" + item.key;
                    }
                    for (let j=0,jlen=3;j<jlen;j+=1) {
                        const key = ["prefix","locator","suffix"][j];
                        if ("undefined" === typeof item[key]) {
                            item[key] = "";
                        }
                    }
                    // remapping of locator label is tricky.
                    if ("undefined" !== typeof item.label && item.locator) {
                        let mm = item.locator.match(rexLabels);
                        if (!mm) {
                            item.locator = labels[item["label"]] + ". " + item["locator"];
                        }
                    }
                    for (let j=0,jlen=3;j<jlen;j+=1) {
                        const key = ["prefix","suffix","locator"][j];
                        if ("string" === typeof item[key]) {
                            item[key] = item[key].split("&quot;").join("\"");
                            item[key] = item[key].replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/g, "*$1*");
                            item[key] = item[key].replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, "**$1**");
                        }
                    }
                    replacement += tmplText.replace("%{1}s", item.prefix)
                        .replace("%{2}s", m_plaintext)
                        .replace("%{3}s", item.locator)
                        .replace("%{4}s", item.suffix)
                        .replace("%{5}s", item.key);
                    count += 1;
                }
                this.newtxt = replacement;
            }
        };

        Fragment.prototype.finalize = function (msg) {
            let m = this.newtxt.match(checkStringRex);
            if (m) {
                this.txt = this.newtxt.split(/[\n\r]+/).join(" ");
                if (msg) {
                    dump("XXX [" + msg + "]: " + this.txt+"\n");
                }
            }
        };

        let ODFConv = function () {};

        ODFConv.prototype.convert = async function () {
            this.rands = {};
            await this.readZipfileContent();

            // Wipe out any font definitions in the style, they can mess things up pretty badly
            this.content = this.content.replace(/\s+fo:font-family="[^"]*"/g, "");

            // Matches wrapped text links
            let lst = this.content.split(rexWrappedLinks);
            for (let i=0,ilen=lst.length;i<ilen;i+=1) {
                lst[i] = new Fragment(lst[i]);
            }
            for (let i=lst.length-2;i>-1;i+=-2) {
                lst[i].normalizeLinkedMarks();
                lst[i].finalize();
            }
            this.rejoin(lst);

            // Matches plain text links
            lst = this.content.split(rexPlainTextLinks);
            for (let i=0,ilen=lst.length;i<ilen;i+=1) {
                lst[i] = new Fragment(lst[i]);
            }
            for (let i=lst.length-2;i>-1;i+=-2) {
                lst[i].normalizeStringMarks();
                lst[i].finalize();
            }
            this.rejoin(lst);

            // Matches native links
            lst = this.content.split(rexNativeLinks);
            for (let i=0,ilen=lst.length;i<ilen;i+=1) {
                lst[i] = new Fragment(lst[i]);
            }
            for (let i=lst.length-2;i>-1;i+=-2) {
                lst[i].normalizeNativeMarks();
                lst[i].finalize();
            }
            this.rejoin(lst);

            this.tidy();

            // Maybe convert to live cites
            if (!reverse_conversion) {
                this.composeCitations();
            }

            this.purgeStyles();
            this.purgeConfig();
            await this.writeZipfileContent();
            return true;
        };

        ODFConv.prototype.rejoin = function (lst) {
            this.content = lst.map(function(obj){
                return obj.txt;
            }).join("");
        };

        ODFConv.prototype.tidy = function () {
            // Eliminate empty balance spans between cites
            let lst = this.content.split(rexCite);
            for (let i=2,ilen=lst.length;i<ilen;i+=2) {
                if (lst[i].match(rexEmptyBalanceSpan)) {
                    lst[i] = "";
                }
            }
            // Remove simple spans surrounding cites
            lst = this.content.split(rexCiteExtended);
            for (let i=1,ilen=lst.length;i<ilen;i+=2) {
                let m = lst[i].match(rexCiteExtendedParts);
                if (m) {
                    lst[i] = m[2];
                }
                m = lst[i].match(rexCiteExtendedPartsReverse);
                if (m) {
                    lst[i] = m[2];
                }
            }
            this.content = lst.join("");
        };

        ODFConv.prototype.composeCitations = function () {
            // Split file string to twin lists
            // and reverse iterate over cites (master recomposition loop)
            // compose items
            // compose citation
            // recompose document
            let ret = [];
            let items = [];
            // Some jiggery-pokery is needed to get a nested
            // list out of JavaScript regexp (as from Python re.findall)
            let m = [];
            let m_all = this.content.match(rexTextAll);
            for (let i=0,ilen=m_all.length;i<ilen;i+=1) {
                let subm = [];
                let m_one = m_all[i].match(rexText);
                for (let j=1,jlen=m_one.length;j<jlen;j+=1) {
                    subm.push(m_one[j]);
                }
                m.push(subm);
            }
            let lst = this.content.split(rexTextPlain);
            ret.push(lst.slice(-1)[0]);
            let placeholder = [];
            for (let i=m.length-1;i>-1;i+=-1) {
                let item = {};
                let plaintextcite = m[i][1].replace(/^\s+/,"").replace(/\s+$/,"").split("\"").join("");
                if (plaintextcite && plaintextcite[0] === "-") {
                    item["suppress-author"] = true;
                    plaintextcite = plaintextcite.slice(1);
                }
                placeholder.push(plaintextcite);
                let link = this.fixMarkup(m[i][4]).replace(/^\s+/,"").replace(/\s+$/,"");

                item.prefix = this.fixMarkup(m[i][0]).replace(/^\s+/,"");
                item.locator = this.fixMarkup(m[i][2]).replace(/^\s+/,"").replace(/\s+$/,"");
                item.suffix = this.fixMarkup(m[i][3]).replace(/\s+$/,"");
                // extract the key
                let params = {};
                if (link.slice(0,22) === "zotero://select/items/") {
                    params.offset = 22;
                    params.splitter = "_";
                    params.fromZoteroSelect = true;
                } else {
                    // Assuming two-char prefix, like zu: or zg:
                    // By flagging the app as well as the library type,
                    // we leave the door open on support for eclectic
                    // citation sources (mixing embedded metadata from
                    // Zotero, Papers, Mendeley, etc). Not practical
                    // yet, but one day ...
                    params.offset = 3;
                    params.splitter = ":";
                    params.fromZoteroSelect = false;
                    if (link.slice(1,2) === "u") {
                        params.isUserItem = true;
                    }
                }
                let myid = link.slice(params.offset);
                let myidlst = myid.split(params.splitter);
                if (myidlst.length === 2) {
                    // the real deal. construct uris
                    item.key = myidlst[1];
                    if (params.isUserItem) {
                        // If we ever want to go back to using the local UserID, this should work
                        // let userID = Zotero.Users.getCurrentUserID();
                        if (myidlst[0] == "0") {
                            userID = 'local/' + Zotero.Users.getLocalUserKey();
                        }
                        else {
                            userID = myidlst[0];
                        }
                        item.uri = ["http://zotero.org/users/" + userID + "/items/" + myidlst[1]];
                        item.uris = item.uri.slice();
                    } else {
                        let groupID = myidlst[0];
                        if (params.fromZoteroSelect) {
                            groupID = Zotero.Groups.getGroupIDFromLibraryID(myidlst[0]);
                        }
                        item.uri = ["http://zotero.org/groups/" + groupID + "/items/" + myidlst[1]];
                        item.uris = item.uri.slice();
                    }
                } else {
                    // punt
                    item.key = myidlst[0];
                }
                items = [item].concat(items);
                if (lst[i]) {
                    placeholder = placeholder.join("; ")
                        .split("\"").join("")
                        .split(/[\\]*&quot;/).join("");
                    let escapedPlaceholder = placeholder.split("&").join("&amp;");
                    items = JSON.stringify(items);
                    items = items.split("\\\\&quot;").join("\\&quot;");
                    items = items.split("\"").join("&quot;");
                    let randstr = this.generateRandomString();
                    let citation = tmplCitation.replace("%{1}s", escapedPlaceholder)
                        .replace("%{2}s",items)
                        .replace("%{3}s",randstr)
                        .replace("%{4}s",placeholder)
                        .replace("%{5}s",escapedPlaceholder)
                        .replace("%{6}s",items)
                        .replace("%{7}s",randstr);
                    //Zotero.debug(citation)
                    ret.push(citation);
                    ret.push(lst[i]);
                    items = [];
                    placeholder = [];
                }

            }
            ret.reverse();
            this.content = ret.join("");

        };

        ODFConv.prototype.fixMarkup = function (str) {
            str = str.replace(rexFixMarkupBold, "&lt;b&gt;$1&lt;/b&gt;");
            str = str.replace(rexFixMarkupItalic, "&lt;i&gt;$1&lt;/i&gt;");
            str = str.split("&quot;").join("\\&quot;");
            str = str.split("\"").join("\\&quot;");
            return str;
        };

        ODFConv.prototype.generateRandomString = function (str) {
            let randstr;
            while (true) {
                let nums = [49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122];
                randstr = "";
                for (let i=0,ilen=10;i<ilen;i+=1) {
                    randstr += String.fromCharCode(nums[parseInt(Math.random() * 61)]);
                }
                if (!this.rands[randstr]) {
                    this.rands[randstr] = true;
                    break;
                }
            }
            return randstr;
        };

        ODFConv.prototype.readZipfileContent = async function () {
            // Scrub any meta string lying around
            this.meta = false;

            // Read the ODF file using JSZip
            const data = await Zotero.File.getBinaryContentsAsync(inputFile.path);
            const zip = await JSZip.loadAsync(data);

            // Get content.xml (required)
            const contentFile = zip.file("content.xml");
            if (!contentFile) {
                throw new Error("Invalid ODF file: content.xml not found");
            }
            this.content = await contentFile.async("string");

            // Get meta.xml (optional)
            const metaFile = zip.file("meta.xml");
            if (metaFile) {
                this.meta = await metaFile.async("string");
            }

            // Store zip for later writing
            this._zip = zip;
        };


        ODFConv.prototype.purgeConfig = function () {
            // Scrub configuration from meta.xml
            if (this.meta) {
                this.meta = this.meta.replace(rexPref, "");
            }
        };


        ODFConv.prototype.writeZipfileContent = async function () {
            // Update content.xml in the zip
            this._zip.file("content.xml", this.content);

            // Update meta.xml if it exists
            if (this.meta) {
                this._zip.file("meta.xml", this.meta);
            }

            // Generate the output as Uint8Array
            const output = await this._zip.generateAsync({
                type: "uint8array",
                compression: "DEFLATE",
                compressionOptions: { level: 9 }
            });

            // Write to output file
            await Zotero.File.putContentsAsync(outputFile.path, output);
        };

        ODFConv.prototype.purgeStyles = function () {
            // Use standard DOMParser (no XPCOM needed in Zotero 7)
            let decodeXML = new DOMParser();
            let encodeXML = new XMLSerializer();

            let doc = decodeXML.parseFromString(this.content,"application/xml");
            let noteBodies = doc.getElementsByTagName("text:note-body");
            let stylesUsedInNotes = {};

            collectNoteStyles();
            fixStyleNodes();
            this.content = encodeXML.serializeToString(doc,"application/xml");

            function collectNoteStyles () {
                for (let i=0,ilen=noteBodies.length;i<ilen;i++) {
                    let node = noteBodies[i];
                    inspectNote(node);
                }
            }

            function inspectNote(node) {
                if (node.hasAttribute("text:style-name")) {
                    let styleName = node.getAttribute("text:style-name").toString();
                    if (styleName !== "Footnote") {
                        stylesUsedInNotes[styleName] = true;
                    }
                }
                for (let i=0,ilen=node.childNodes.length;i<ilen;i++) {
                    let child = node.childNodes[i];
                    if (!child.tagName) continue;
                    inspectNote(child);
                }
            }

            function fixStyleNodes() {
                let styleNodes = doc.getElementsByTagName("style:style");
                for (let i=0,ilen=styleNodes.length;i<ilen;i++) {
                    let styleNode = styleNodes[i];
                    let styleName = styleNode.getAttribute("style:name").toString();
                    if (stylesUsedInNotes[styleName]) {
                        fixStyleNode(styleNode);
                    }
                }
            }

            function fixStyleNode(node) {
                let textPropertyNodes = node.getElementsByTagName("style:text-properties");
                for (let i=0,ilen=textPropertyNodes.length;i<ilen;i++) {
                    let textPropertyNode = textPropertyNodes[i];
                    let unwantedAttributes = ["style:font-name","fo:font-size","style:font-size-asian"];
                    for (let j=0,jlen=unwantedAttributes.length;j<jlen;j++) {
                        let attributeName = unwantedAttributes[j];
                        if (textPropertyNode.hasAttribute(attributeName)) {
                            textPropertyNode.removeAttribute(attributeName);
                        }
                    }
                }
            }

        };

        let odfConv = new ODFConv();
        try {
            if (await odfConv.convert()) {
                WizardController.setCanAdvance(true);
                WizardController.advance();
            }
        } catch (e) {
            // Show error message and rewind to intro page
            Zotero.debug("ERROR (rtf-odf-scan-for-zotero): "+e);
            let errorMsg = document.getElementById("odf-file-error-message");
            if (errorMsg) {
                errorMsg.style.display = "block";
            }
            WizardController.rewind();
            WizardController.setCanAdvance(false);
        }
    }










    /**
   * Switches between file modes
   */
    this.fileTypeSwitch = function (mode) {
        if (!mode) {
            mode = "odf-tocitations";
        }
        mode = mode.split("-");
        let fileType = mode[0];
        let outputMode = mode[1];
        if (!outputMode) {
            // Keep things sane
            mode = "odf-tocitations";
            outputMode = "tocitations";
        }
        let nodeIdStubs = [
            "file-type-description",
            "choose-input-file",
            "choose-output-file"
        ];
        for (let i=0,ilen=nodeIdStubs.length;i<ilen;i+=1) {
            let elems = document.getElementsByClassName(nodeIdStubs[i]);
            for (let j=0,jlen=elems.length;j<jlen;j+=1) {
                let elem = elems[j];
                if (elem.id === (nodeIdStubs[i] + "-" + fileType)) {
                    elem.hidden = false;
                } else {
                    elem.hidden = true;
                }
            }
        }
        Zotero.Prefs.set("ODFScan.fileType", fileType);
        Zotero.Prefs.set("ODFScan.outputMode", outputMode);
        _refreshPath();
    };


};

// Initialize dialog when DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    Zotero_ODFScan.init();
});
