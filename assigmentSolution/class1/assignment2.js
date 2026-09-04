const fs = require('fs');
const path = require('path');

function findFilesByExtension(dirPath, extension) {
    if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }

    const results = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, {
            withFileTypes: true
        });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (
                entry.isFile() &&
                path.extname(entry.name).toLowerCase() ===
                    extension.toLowerCase()
            ) {
                results.push(path.resolve(fullPath));
            }
        }
    }

    walk(dirPath);

    return results.sort();
}

module.exports = { findFilesByExtension };