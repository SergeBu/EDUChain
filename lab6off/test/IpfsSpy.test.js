const IpfsSpy = require('../services/IpfsSpy');

describe('IpfsSpy', () => {
  let ipfsSpy;

  beforeEach(() => {
    ipfsSpy = new IpfsSpy();
  });

  afterEach(() => {
    ipfsSpy.reset();
  });

  test('should track add calls and return response', async () => {
    const data = Buffer.from('test data');
    const options = { pin: true };
    
    const response = await ipfsSpy.add(data, options);
    
    expect(response).toEqual(expect.objectContaining({
      cid: expect.any(String),
      size: expect.any(Number)
    }));
    
    const addCalls = ipfsSpy.getAddCalls();
    expect(addCalls).toHaveLength(1);
    expect(addCalls[0].data).toEqual(data);
    expect(addCalls[0].options).toEqual(options);
    expect(addCalls[0].response).toEqual(response);
  });

  test('should track cat calls and return content', async () => {
    const cid = 'QmTestCID';
    const options = { timeout: 5000 };
    
    const content = await ipfsSpy.cat(cid, options);
    
    expect(content).toBeInstanceOf(Buffer);
    
    const catCalls = ipfsSpy.getCatCalls();
    expect(catCalls).toHaveLength(1);
    expect(catCalls[0].cid).toBe(cid);
    expect(catCalls[0].options).toEqual(options);
  });

  test('should track pin operations', async () => {
    const cid = 'QmPinnedCID';
    
    const pinResponse = await ipfsSpy.pin.add(cid);
    const unpinResponse = await ipfsSpy.pin.rm(cid);
    
    expect(pinResponse).toEqual(expect.objectContaining({ cid: expect.any(String) }));
    expect(unpinResponse).toEqual(expect.objectContaining({ cid: expect.any(String) }));
    
    expect(ipfsSpy.getPinAddCalls()).toHaveLength(1);
    expect(ipfsSpy.getPinRmCalls()).toHaveLength(1);
    expect(ipfsSpy.getLastCall('pin.add').cid).toBe(cid);
    expect(ipfsSpy.getLastCall('pin.rm').cid).toBe(cid);
  });

  test('should track files operations', async () => {
    const path = '/test/path';
    
    const statResponse = await ipfsSpy.files.stat(path);
    const lsResponse = await ipfsSpy.files.ls(path);
    
    expect(statResponse).toEqual(expect.objectContaining({
      size: expect.any(Number),
      cumulativeSize: expect.any(Number)
    }));
    expect(lsResponse).toBeInstanceOf(Array);
    
    expect(ipfsSpy.getFilesStatCalls()).toHaveLength(1);
    expect(ipfsSpy.getFilesLsCalls()).toHaveLength(1);
    expect(ipfsSpy.getLastCall('files.stat').path).toBe(path);
    expect(ipfsSpy.getLastCall('files.ls').path).toBe(path);
  });

  test('should reset call history', async () => {
    await ipfsSpy.add(Buffer.from('test'));
    await ipfsSpy.cat('QmTest');
    
    expect(ipfsSpy.getAddCalls()).toHaveLength(1);
    expect(ipfsSpy.getCatCalls()).toHaveLength(1);
    
    ipfsSpy.reset();
    
    expect(ipfsSpy.getAddCalls()).toHaveLength(0);
    expect(ipfsSpy.getCatCalls()).toHaveLength(0);
    expect(ipfsSpy.getCallCount('add')).toBe(0);
  });

  test('should use custom responses', async () => {
    const customAddResponse = { cid: 'QmCustomCID', size: 256 };
    const customCatContent = Buffer.from('custom content');
    
    ipfsSpy.setResponse('add', customAddResponse);
    ipfsSpy.setResponse('cat', customCatContent);
    
    const addResult = await ipfsSpy.add(Buffer.from('data'));
    const catResult = await ipfsSpy.cat('any-cid');
    
    expect(addResult).toEqual(customAddResponse);
    expect(catResult).toEqual(customCatContent);
    
    expect(ipfsSpy.getAddCalls()[0].response).toEqual(customAddResponse);
    expect(ipfsSpy.getCatCalls()[0].response).toEqual(customCatContent);
  });

  test('should track call counts', async () => {
    expect(ipfsSpy.wasMethodCalled('add')).toBe(false);
    expect(ipfsSpy.getCallCount('add')).toBe(0);
    
    await ipfsSpy.add(Buffer.from('first'));
    await ipfsSpy.add(Buffer.from('second'));
    
    expect(ipfsSpy.wasMethodCalled('add')).toBe(true);
    expect(ipfsSpy.getCallCount('add')).toBe(2);
    expect(ipfsSpy.getCallCount('cat')).toBe(0);
  });

  test('should retrieve last call details', async () => {
    const firstData = Buffer.from('first');
    await ipfsSpy.add(firstData);
    
    const secondData = Buffer.from('second');
    const secondOptions = { pin: false };
    await ipfsSpy.add(secondData, secondOptions);
    
    const lastCall = ipfsSpy.getLastCall('add');
    
    expect(lastCall.data).toEqual(secondData);
    expect(lastCall.options).toEqual(secondOptions);
    expect(lastCall.response).toEqual(expect.any(Object));
  });

  test('should handle unknown methods', () => {
    expect(ipfsSpy.wasMethodCalled('unknownMethod')).toBe(false);
    expect(ipfsSpy.getCallCount('unknownMethod')).toBe(0);
    expect(ipfsSpy.getLastCall('unknownMethod')).toBeNull();
  });

  test('should track calls with different parameters', async () => {
    const testCases = [
      { data: Buffer.from('1'), options: { pin: true } },
      { data: Buffer.from('2'), options: { pin: false, timeout: 1000 } },
      { data: Buffer.from('3') } // без options
    ];
    
    for (const testCase of testCases) {
      await ipfsSpy.add(testCase.data, testCase.options);
    }
    
    const addCalls = ipfsSpy.getAddCalls();
    expect(addCalls).toHaveLength(3);
    
    testCases.forEach((testCase, index) => {
      expect(addCalls[index].data).toEqual(testCase.data);
      expect(addCalls[index].options).toEqual(testCase.options || {});
    });
  });
test('should reset call history', async () => {
  // Выполняем несколько вызовов разных методов
  await ipfsSpy.add(Buffer.from('test'));
  await ipfsSpy.cat('QmTest');
  await ipfsSpy.pin.add('QmPin');
  await ipfsSpy.pin.rm('QmPin');
  await ipfsSpy.files.stat('/path');
  await ipfsSpy.files.ls('/path');
  
  // Проверяем, что вызовы зарегистрированы
  expect(ipfsSpy.getCallCount('add')).toBe(1);
  expect(ipfsSpy.getCallCount('cat')).toBe(1);
  expect(ipfsSpy.getCallCount('pin.add')).toBe(1);
  expect(ipfsSpy.getCallCount('pin.rm')).toBe(1);
  expect(ipfsSpy.getCallCount('files.stat')).toBe(1);
  expect(ipfsSpy.getCallCount('files.ls')).toBe(1);
  
  // Сбрасываем историю
  ipfsSpy.reset();
  
  // Проверяем, что все счетчики обнулились
  expect(ipfsSpy.getCallCount('add')).toBe(0);
  expect(ipfsSpy.getCallCount('cat')).toBe(0);
  expect(ipfsSpy.getCallCount('pin.add')).toBe(0);
  expect(ipfsSpy.getCallCount('pin.rm')).toBe(0);
  expect(ipfsSpy.getCallCount('files.stat')).toBe(0);
  expect(ipfsSpy.getCallCount('files.ls')).toBe(0);
  
  // Проверяем, что методы получения вызовов возвращают пустые массивы
  expect(ipfsSpy.getAddCalls()).toHaveLength(0);
  expect(ipfsSpy.getCatCalls()).toHaveLength(0);
  expect(ipfsSpy.getPinAddCalls()).toHaveLength(0);
  expect(ipfsSpy.getPinRmCalls()).toHaveLength(0);
  expect(ipfsSpy.getFilesStatCalls()).toHaveLength(0);
  expect(ipfsSpy.getFilesLsCalls()).toHaveLength(0);
});
  test('should return default responses', async () => {
    const addResponse = await ipfsSpy.add(Buffer.from('test'));
    expect(addResponse).toEqual(expect.objectContaining({
      cid: expect.any(String),
      size: expect.any(Number)
    }));
    
    const catResponse = await ipfsSpy.cat('cid');
    expect(catResponse).toBeInstanceOf(Buffer);
    
    const pinAddResponse = await ipfsSpy.pin.add('cid');
    expect(pinAddResponse).toEqual(expect.objectContaining({ cid: expect.any(String) }));
    
    const pinRmResponse = await ipfsSpy.pin.rm('cid');
    expect(pinRmResponse).toEqual(expect.objectContaining({ cid: expect.any(String) }));
    
    const statResponse = await ipfsSpy.files.stat('/path');
    expect(statResponse).toEqual(expect.objectContaining({
      size: expect.any(Number),
      cumulativeSize: expect.any(Number)
    }));
    
    const lsResponse = await ipfsSpy.files.ls('/path');
    expect(lsResponse).toBeInstanceOf(Array);
    expect(lsResponse[0]).toEqual(expect.objectContaining({
      name: expect.any(String),
      type: expect.any(String),
      cid: expect.any(String)
    }));
  });
});