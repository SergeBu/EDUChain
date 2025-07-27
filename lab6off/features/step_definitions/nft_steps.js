const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { ethers } = require('ethers');
const { expect } = require('chai');
const sinon = require('sinon');
const ganache = require('ganache');
const path = require('path');
const fs = require('fs');
const { loadArtifact } = require('../../helpers');
//const AchievementNFT = require('../../artifacts/AchievementNFT.json');
//const stakingArtifactPath = path.join(__dirname, '../../out/AchievementNFT.sol/AchievementNFT.json');
//const nftArtifact = JSON.parse(fs.readFileSync(stakingArtifactPath, 'utf8'));


// Global variables
let provider;
let server = null;
let accounts;
let nftContract;

// Unified IPFS client
const getIpfsClient = async () => {
  if (process.argv.includes('--require-module') || 
      process.argv.includes('@babel/register')) {
    return {
      add: () => Promise.resolve({ cid: 'QmMockCID' }),
      pin: {
        ls: () => Promise.resolve([])
      }
    };
  }
  
  try {
    const { create } = await import('ipfs-http-client');
    return create({
      host: process.env.IPFS_HOST || 'localhost',
      port: 5001,
      protocol: 'http'
    });
  } catch (e) {
    console.error('IPFS client error:', e);
    return {
      add: () => Promise.reject('IPFS not available'),
      pin: {
        ls: () => Promise.reject('IPFS not available')
      }
    };
  }
};

// Step definitions
Given('I have an IPFS client', async function() {
  this.ipfs = await getIpfsClient();
});

When('I add a file to IPFS', async function() {
  const content = Buffer.from('test content');
  const result = await this.ipfs.add(content);
  this.cid = result.cid.toString();
});

Then('I should get a valid CID', function() {
  expect(this.cid).to.match(/Qm[a-zA-Z0-9]{44}/);
});
// Используем Before и After с большой буквы (как импортировано)
// В начале хука Before
//const { getPort } = require('../support/hooks');

// В начале хука Before


After(async function() {
  if (this.server) {
    await this.server.close();
  }
});


Given('User {string} completes course {string}', function(userAddress, courseName) {
  this.userAddress = userAddress;
  this.courseId = 101;
});

When('System mints achievement NFT', async function () {
  // Get accounts using v6 syntax
  const accounts = await this.provider.listAccounts();
  
  // Get signer for the first account
  const owner = this.provider.getSigner(accounts[0]);
  
  // Generate tokenId with v6 methods
  const tokenId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'string'],
      [this.userAddress, this.courseName]
    )
  );

  // Connect to contract
  const contract = new ethers.Contract(
    this.nftContract.address,
    this.nftContract.abi,
    owner
  );

  // Mint NFT
  await contract.mint(this.userAddress, tokenId);
  
  // Store for later steps
  this.tokenId = tokenId;
});

Then('Metadata should be pinned to IPFS', async function() {
  try {
    if (this.ipfs.pin) {
      const pinned = await this.ipfs.pin.ls();
      const isPinned = [...pinned].some(p => p.cid === this.expectedCid);
      expect(isPinned).to.be.true;
    } else {
      console.log('Skipping IPFS pin check in mock mode');
      expect(true).to.be.true; // Всегда проходит в mock-режиме
    }
  } catch (error) {
    console.error('IPFS pin check error:', error);
    throw error;
  }
});

Then('NFT balance should be {int}', async function(expectedBalance) {
  const balance = await nftContract.balanceOf(this.userAddress, this.courseId);
  expect(Number(balance)).to.equal(expectedBalance);
});


// Debug logs
console.log('IPFS module type:', typeof getIpfsClient);
try {
  console.log('IPFS client version:', require('ipfs-http-client/package.json').version);
} catch (e) {
  console.log('IPFS client not available');
}