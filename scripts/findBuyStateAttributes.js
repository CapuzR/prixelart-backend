const fs = require('fs');
const path = require('path');

// Recursive function to get all .js/.jsx/.ts/.tsx files in a directory
function getFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.lstatSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Function to search for buyState initialization and attributes in the file content
function searchBuyState(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Regex to match buyState initialization (useState, redux, etc.)
  const initRegex = /const\s*\[\s*buyState\s*,\s*.*\s*\]\s*=\s*useState\s*\(([^)]*)\)/g;
  const attributeRegex = /buyState\.(?!map|filter|find|length)(\w+)/g;
  
  let initMatches = initRegex.exec(content);
  let attrMatches;
  let attributes = [];

  // Log buyState initialization, if found
  if (initMatches) {
    console.log(`Found buyState initialization in file: ${file}`);
    console.log(`Initial value: ${initMatches[1]}`);
  }

  // Collect all buyState attribute accesses
  while ((attrMatches = attributeRegex.exec(content)) !== null) {
    const attr = attrMatches[1];
    if (attr && !attributes.includes(attr)) {
      attributes.push(attr);
    }
  }

  return attributes.length > 0 ? { file, attributes } : null;
}

// Get all files in the project (adjust the path to your source folder)
const files = getFiles('../prixelart-frontend/src');

let buyStateAttributes = {};

// Collect buyState attributes and initialization from all files
files.forEach(file => {
  const result = searchBuyState(file);
  if (result) {
    buyStateAttributes[file] = result.attributes;
  }
});

// Prepare output
let output = 'List of files and buyState attributes found:\n';
Object.entries(buyStateAttributes).forEach(([file, attributes]) => {
  output += `${file}: ${attributes.join(', ')}\n`;
});

// Write the output to a file
const outputPath = path.join(__dirname, 'buyState-attributes-report.txt');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`buyState attributes report written to: ${outputPath}`);
