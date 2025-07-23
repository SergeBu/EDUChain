class IPFSService {
  constructor(heliaModule, stringsModule) {
    this.heliaModule = heliaModule;
    this.stringsModule = stringsModule;
  }

  async uploadToIPFS(data) {
    const helia = await this.heliaModule.createHelia();
    const str = this.stringsModule.strings(helia);
    const cid = await str.add(data);
    return cid.toString();
  }
}

module.exports = IPFSService;