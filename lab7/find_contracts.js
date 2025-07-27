const fs = require('fs');
const path = require('path');

function searchContracts(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      searchContracts(filePath);
    } else if (file === 'EduchainStaking.json') {
      console.log('Found contract:', filePath);
    }
  }
}

console.log('Searching for contracts...');
searchContracts(path.join(__dirname, 'out'));
