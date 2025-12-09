#!/usr/bin/env python3

import zipfile
import glob
import argparse
import os
import json
from lxml import etree


class Builder:

    def __init__(self):
        parser = argparse.ArgumentParser()
        parser.add_argument("--beta",
                            action='store_true',
                            help="build beta XPI")
        parser.add_argument("--release",
                            action='store_true',
                            help="update update.rdf")
        args = parser.parse_args()
        self.beta = args.beta
        self.release = args.release

        if self.beta and self.release:
            raise ValueError('Cannot release a beta')

        with open('package.json') as f:
            self.package = json.load(f)
        self.version = self.package['version']

        if self.beta:
            self.version += '-beta'

        self.xpi = 'zotero-odf-scan-v' + self.version + '.xpi'

        self.build()
        if self.release:
            self.update_rdf()

    def namespaces(self, doc):
        namespaces = {}
        for ns in doc.xpath('//namespace::*'):
            if ns[0]:  # Removes the None namespace, neither needed nor supported.
                namespaces[ns[0]] = ns[1]
        return namespaces

    def update_rdf(self):
        rdf = etree.parse('docs/update.rdf')
        namespaces = self.namespaces(rdf)
        for version in rdf.findall('.//em:version', namespaces=namespaces):
            version.text = self.version
        for link in rdf.findall('.//em:updateLink', namespaces=namespaces):
            link.text = 'https://github.com/Juris-M/zotero-odf-scan-plugin/releases/download/v' + self.version + '/zotero-odf-scan-v' + self.version + '.xpi'
        with open('docs/update.rdf', 'wb') as f:
            f.write(etree.tostring(rdf, pretty_print=True))

    def build(self):
        for xpi in glob.glob('*.xpi'):
            os.remove(xpi)

        with zipfile.ZipFile(self.xpi, 'w', zipfile.ZIP_DEFLATED) as xpi:
            # Include new Zotero 7 files
            files_to_include = [
                'bootstrap.js',
                'manifest.json',
                'prefs.js',
            ]

            # Add content files (XHTML, JS, CSS)
            files_to_include.extend(glob.glob('content/*.xhtml', recursive=False))
            files_to_include.extend(glob.glob('content/*.js', recursive=False))
            files_to_include.extend(glob.glob('content/*.css', recursive=False))

            # Add locale files (FTL)
            files_to_include.extend(glob.glob('locale/**/*.ftl', recursive=True))

            # Add resource files (translators)
            files_to_include.extend(glob.glob('resource/**/*', recursive=True))

            # Filter out directories
            files_to_include = [f for f in files_to_include if os.path.isfile(f)]

            for file in files_to_include:
                if file == 'manifest.json':
                    # Update version in manifest.json
                    with open(file) as f:
                        manifest = json.load(f)
                    manifest['version'] = self.version
                    xpi.writestr(file, json.dumps(manifest, indent=2))
                else:
                    xpi.write(file)


Builder()
