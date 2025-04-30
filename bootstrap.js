
function log(msg) {
    Zotero.debug("Zotero S3 Sync: " + msg);
}

function install() {
    log("installed");
}
function uninstall() {
    log("uninstalled");
}
function shutdown() {
    log("shutting down");
}

async function startup({id, version, rootURI}) {

    /*
    Zotero.PreferencePanes.register({
                image: 'chrome/skin/amazon-s3.svg',
                pluginID: 'juris-m@juris-m.github.io',
                src: rootURI + 'prefs.xhtml'
        });
        */

    
    Services.scriptloader.loadSubScript(rootURI + "s3.js");

    // const prefs = Services.prefs.getBranch("extensions.zotero-s3-sync.");

    // ZoteroRTF.init({ id, version, rootURI });
    // ZoteroRTF.addToAllWindows();
    log("S3 Sync storage mode registered.");
    
}
