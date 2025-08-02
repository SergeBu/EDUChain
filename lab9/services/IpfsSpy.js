class IpfsSpy {
  constructor() {
    this.calls = {
      add: [],
      cat: [],
      pin: {
        add: [],
        rm: []
      },
      files: {
        stat: [],
        ls: []
      }
    };
    
    // Ответы по умолчанию
    this.responses = {
      add: { cid: 'QmDefaultAddCID', size: 100 },
      cat: Buffer.from('default content'),
      pin: {
        add: { cid: 'QmDefaultPinCID' },
        rm: { cid: 'QmDefaultUnpinCID' }
      },
      files: {
        stat: { size: 200, cumulativeSize: 300 },
        ls: [{ name: 'file.txt', type: 'file', cid: 'QmDefaultLsCID' }]
      }
    };

    // Создаем вложенные объекты для pin и files
    this.pin = {
      add: this._pinAdd.bind(this),
      rm: this._pinRm.bind(this)
    };

    this.files = {
      stat: this._filesStat.bind(this),
      ls: this._filesLs.bind(this)
    };
  }

  // Установка кастомных ответов
  setResponse(method, response) {
    // Для вложенных методов (например, pin.add) method будет строкой 'pin.add'
    const parts = method.split('.');
    let target = this.responses;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!target[part]) {
        target[part] = {};
      }
      target = target[part];
    }
    target[parts[parts.length - 1]] = response;
  }

  // Сброс истории вызовов
  reset() {
    // Явно сбрасываем все массивы вызовов
    this.calls.add = [];
    this.calls.cat = [];
    this.calls.pin.add = [];
    this.calls.pin.rm = [];
    this.calls.files.stat = [];
    this.calls.files.ls = [];
  }

  _resetObject(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this._resetObject(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = [];
      }
    }
  }

  // Методы IPFS
  async add(data, options = {}) {
    const response = this.responses.add;
    this.calls.add.push({ data, options, response });
    return response;
  }

  async cat(cid, options = {}) {
    const response = this.responses.cat;
    this.calls.cat.push({ cid, options, response });
    return response;
  }

  // Приватные методы для вложенных объектов
  async _pinAdd(cid, options = {}) {
    const response = this.responses.pin.add;
    this.calls.pin.add.push({ cid, options, response });
    return response;
  }

  async _pinRm(cid, options = {}) {
    const response = this.responses.pin.rm;
    this.calls.pin.rm.push({ cid, options, response });
    return response;
  }

  async _filesStat(path, options = {}) {
    const response = this.responses.files.stat;
    this.calls.files.stat.push({ path, options, response });
    return response;
  }

  async _filesLs(path, options = {}) {
    const response = this.responses.files.ls;
    this.calls.files.ls.push({ path, options, response });
    return response;
  }

  // Методы проверки
  getAddCalls() {
    return this.calls.add;
  }

  getCatCalls() {
    return this.calls.cat;
  }

  getPinAddCalls() {
    return this.calls.pin.add;
  }

  getPinRmCalls() {
    return this.calls.pin.rm;
  }

  getFilesStatCalls() {
    return this.calls.files.stat;
  }

  getFilesLsCalls() {
    return this.calls.files.ls;
  }

  // Общие методы проверки
  wasMethodCalled(methodPath) {
    const parts = methodPath.split('.');
    let current = this.calls;
    for (const part of parts) {
      if (!current[part]) return false;
      current = current[part];
    }
    return Array.isArray(current) ? current.length > 0 : false;
  }

  getCallCount(methodPath) {
    const parts = methodPath.split('.');
    let current = this.calls;
    for (const part of parts) {
      if (!current[part]) return 0;
      current = current[part];
    }
    return Array.isArray(current) ? current.length : 0;
  }

  getLastCall(methodPath) {
    const parts = methodPath.split('.');
    let current = this.calls;
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    if (!Array.isArray(current) || current.length === 0) {
      return null;
    }
    return current[current.length - 1];
  }
}

module.exports = IpfsSpy;