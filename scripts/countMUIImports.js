const fs = require('fs');
const path = require('path');

// Recursive function to get all files in a directory
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

// Search for MUI components in files and return detailed info
function searchMUIComponents(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Updated regex to match named imports from both @mui/material and @material-ui/core
  const regex = /import\s*{([^}]*)}\s*from\s*['"]@(?:mui\/material|material-ui\/core)['"]/gs;
  let matches;
  let components = [];

  // Iterate over all matches in the file
  while ((matches = regex.exec(content)) !== null) {
    // Split the matched components by commas, trim whitespace, and filter empty entries
    components = components.concat(
      matches[1]
        .split(',')
        .map(component => component.trim())
        .filter(Boolean) // Ensure no empty components
    );
  }

  return components.length > 0 ? { file, components } : null;
}

// Get all files in your project
const files = getFiles('../prixelart-frontend/src'); // Adjust the path to your source folder

let totalMUIComponents = 0;
let componentDetails = []; // List of { file, components }
let fileComponentCount = {}; // To store { file: count }
let uniqueComponents = new Set(); // To store unique component names

// Collect MUI components from all files
files.forEach(file => {
  const result = searchMUIComponents(file);
  if (result) {
    componentDetails.push(result);
    fileComponentCount[file] = result.components.length;
    totalMUIComponents += result.components.length;
    
    // Add each component to the Set to track unique components
    result.components.forEach(component => uniqueComponents.add(component));
  }
});

// Sort componentDetails based on the number of components in each file (descending)
componentDetails.sort((a, b) => b.components.length - a.components.length);

// Sort fileComponentCount by component count (descending)
const sortedFileComponentCount = Object.entries(fileComponentCount)
  .sort(([, countA], [, countB]) => countB - countA);

// Prepare data to write to a file
let output = `Total MUI component imports: ${totalMUIComponents}\n`;
output += `Unique MUI components: ${uniqueComponents.size}\n\n`;

// List of files and the MUI components they import (sorted)
output += "List of files and imported MUI components (sorted by number of components):\n";
componentDetails.forEach(detail => {
  output += `${detail.file} -> ${detail.components.join(', ')}\n`;
});

// List of files and the total number of MUI components they import (sorted)
output += `\nList of files and the total MUI components they import (sorted by component count):\n`;
sortedFileComponentCount.forEach(([file, count]) => {
  output += `${file}: ${count} components\n`;
});

// Write to a file in the project root
const outputPath = path.join(__dirname, 'mui-component-report.txt');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`MUI component report written to: ${outputPath}`);
