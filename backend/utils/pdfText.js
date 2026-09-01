/**
 * PDF text extraction.
 *
 * Replaces `pdf-parse`, which bundles a 2018 build of pdf.js. That build fails
 * on several legitimate producers — including pdfkit, which is what BookForge's
 * own PDF export uses, so a user could not re-ingest a book this app produced.
 * It is also sensitive to `bson` (loaded by mongoose) being present in the
 * process, which made failures look random.
 *
 * pdfjs-dist is the maintained upstream of the same engine.
 */

let pdfjsPromise = null;

// pdfjs-dist v4 is ESM-only; load it once and reuse.
function loadPdfjs() {
    if (!pdfjsPromise) {
        pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
    }
    return pdfjsPromise;
}

/**
 * @param {Buffer} buffer raw PDF bytes
 * @returns {Promise<{ text: string, numPages: number }>}
 */
async function extractPdfText(buffer) {
    const pdfjs = await loadPdfjs();

    const doc = await pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        // Never evaluate embedded JavaScript from an uploaded document.
        isEvalSupported: false,
    }).promise;

    const pages = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const content = await page.getTextContent();

        // Rebuild lines: pdf.js emits positioned runs, and `hasEOL` marks the
        // end of a visual line. Without this the whole page collapses into one
        // run-on paragraph.
        let pageText = '';
        for (const item of content.items) {
            if (typeof item.str !== 'string') continue;
            pageText += item.str;
            if (item.hasEOL) pageText += '\n';
            else if (!item.str.endsWith(' ')) pageText += ' ';
        }
        pages.push(pageText.replace(/[ \t]+\n/g, '\n').trim());
        page.cleanup();
    }

    await doc.destroy();

    return { text: pages.join('\n\n'), numPages: doc.numPages };
}

module.exports = { extractPdfText };
