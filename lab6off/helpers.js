const path = require('path');
const fs = require('fs');

function loadArtifact(contractName) {
  // Пробуем найти артефакт в разных местах
  const paths = [
    // Для Hardhat
    path.join(__dirname, `../artifacts/${contractName}.json`),
    // Для Foundry
    path.join(__dirname, `../out/${contractName}.sol/${contractName}.json`),
    // Альтернативные пути
    path.join(__dirname, `../../artifacts/contracts/${contractName}.sol/${contractName}.json`),
    path.join(__dirname, `../../out/${contractName}.sol/${contractName}.json`),
  ];

  for (const artifactPath of paths) {
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return {
        abi: artifact.abi,
        bytecode: artifact.bytecode,
      };
    }
  }

  throw new Error(`Artifact for ${contractName} not found in any location`);
}

module.exports = { loadArtifact };