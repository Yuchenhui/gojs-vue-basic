import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_js = path.join(__dirname, './node_modules/gojs/release/go.js');
const file_mjs = path.join(__dirname, './node_modules/gojs/release/go.mjs');
const file_module = path.join(__dirname, './node_modules/gojs/release/go-module.js');
const file_debug_js = path.join(__dirname, './node_modules/gojs/release/go-debug.js');
const file_debug_mjs = path.join(__dirname, './node_modules/gojs/release/go-debug.mjs');
const file_debug_module = path.join(__dirname, './node_modules/gojs/release/go-debug-module.js');

const doReplace = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        let hasMatch = false;
        const content = data.replace(
            /o\+=String\.fromCharCode\(t\.charCodeAt\(r\)\^i\[\(i\[e\]\+i\[s\]\)%256\]\);return o\}/gi,
            function (match) {
                if (match) hasMatch = true;
                return `o+=String.fromCharCode(t.charCodeAt(r)^i[(i[e]+i[s])%256]);if (o.indexOf("GoJS 3.0 evaluation") > -1 || o.indexOf("(c) 1998-2024 Northwoods Software") > -1 || o.indexOf("Not for distribution or production use") > -1 || o.indexOf("gojs.net") > -1) {return "";} else {return o;}}`;
            }
        );
        await fs.writeFile(filePath, content, 'utf8');
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    }
};

(async () => {
    await doReplace(file_js);
    await doReplace(file_mjs);
    await doReplace(file_module);
    await doReplace(file_debug_js);
    await doReplace(file_debug_mjs);
    await doReplace(file_debug_module);
})();
