const fs = require('fs');
const path = require('path');
const folderPath = 'scraper_output/';
const csvFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.csv'));

csvFiles.forEach(file => {
    const fullPath = path.join(folderPath, file);
    addDefaultStatusColumnToFile(fullPath);
});

function addDefaultStatusColumnToFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');

    const updatedLines = lines.map((line, index) => {
        const parts = line.split(';');

        if (index === 0) return line;

        parts.splice(5, 0, '0');
        return parts.join(';');
    });

    fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
}
