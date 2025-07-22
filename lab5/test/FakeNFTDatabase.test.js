const FakeNFTDatabase = require('../services/FakeNFTDatabase');

describe('FakeNFTDatabase', () => {
  let db;

  beforeEach(() => {
    db = new FakeNFTDatabase();
	  jest.useFakeTimers(); // Add this line
  });
  
	afterEach(() => {
		jest.useRealTimers(); // Clean up timers
	});
  test('should create and retrieve metadata', () => {
    const metadata = {
      name: "Test NFT",
      owner: "0x123",
      description: "Test description",
      image: "ipfs://QmTest"
    };
    
    const created = db.createMetadata(metadata);
    expect(created.id).toBeDefined();
    expect(created.name).toBe("Test NFT");
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();
    
    const retrieved = db.getMetadata(created.id);
    expect(retrieved).toEqual(created);
  });

  test('should update metadata', () => {
    const nft = db.createMetadata({ 
      owner: "0x123", 
      collection: "test-collection" 
    });
  // Force timestamp difference
  const originalUpdatedAt = nft.updatedAt;
  jest.advanceTimersByTime(1); // Advance time by 1ms
  
    // Обновляем два поля
    const updated = db.updateMetadata(nft.id, { 
      owner: "0x456", 
      price: "1.5 ETH" 
    });
    
    // Проверяем обновленные поля
    expect(updated.owner).toBe("0x456");
    expect(updated.price).toBe("1.5 ETH");
   expect(updated.updatedAt).not.toEqual(originalUpdatedAt);
   
    // Проверяем неизменные поля
    expect(updated.collection).toBe("test-collection");
    
    // Проверяем индексы
    expect(db.getByOwner("0x123")).toHaveLength(0);
    expect(db.getByOwner("0x456")).toHaveLength(1);
    expect(db.getByCollection("test-collection")).toHaveLength(1);
  });

  test('should delete metadata', () => {
    const nft = db.createMetadata({ 
      owner: "0x789", 
      collection: "deleted-collection" 
    });
    
    const result = db.deleteMetadata(nft.id);
    expect(result).toBe(true);
    
    // Проверяем основное хранилище
    expect(db.getMetadata(nft.id)).toBeNull();
    
    // Проверяем индексы
    expect(db.getByOwner("0x789")).toHaveLength(0);
    expect(db.getByCollection("deleted-collection")).toHaveLength(0);
    
    // Повторное удаление
    expect(db.deleteMetadata(nft.id)).toBe(false);
  });

  test('should handle owner changes', () => {
    const nft = db.createMetadata({ owner: "0x1" });
    
    // Первое изменение владельца
    db.updateMetadata(nft.id, { owner: "0x2" });
    
    // Второе изменение владельца
    db.updateMetadata(nft.id, { owner: "0x3" });
    
    // Проверяем индексы
    expect(db.getByOwner("0x1")).toHaveLength(0);
    expect(db.getByOwner("0x2")).toHaveLength(0);
    expect(db.getByOwner("0x3")).toHaveLength(1);
  });

  test('should handle collection changes', () => {
    const nft = db.createMetadata({ collection: "A" });
    db.updateMetadata(nft.id, { collection: "B" });
    
    expect(db.getByCollection("A")).toHaveLength(0);
    expect(db.getByCollection("B")).toHaveLength(1);
  });

  test('should get NFTs by owner', () => {
    db.createMetadata({ owner: "0xAlice" });
    db.createMetadata({ owner: "0xAlice" });
    db.createMetadata({ owner: "0xBob" });
    
    expect(db.getByOwner("0xAlice")).toHaveLength(2);
    expect(db.getByOwner("0xBob")).toHaveLength(1);
    expect(db.getByOwner("0xUnknown")).toHaveLength(0);
  });

  test('should get NFTs by collection', () => {
    db.createMetadata({ collection: "Punks" });
    db.createMetadata({ collection: "Punks" });
    db.createMetadata({ collection: "BoredApes" });
    
    expect(db.getByCollection("Punks")).toHaveLength(2);
    expect(db.getByCollection("BoredApes")).toHaveLength(1);
    expect(db.getByCollection("UnknownCollection")).toHaveLength(0);
  });

  test('should reset database', () => {
    db.createMetadata({ name: "Test NFT 1" });
    db.createMetadata({ name: "Test NFT 2" });
    
    expect(db.getAllMetadata()).toHaveLength(2);
    
    db.reset();
    
    expect(db.getAllMetadata()).toHaveLength(0);
    expect(db.getByOwner("any")).toHaveLength(0);
    expect(db.getByCollection("any")).toHaveLength(0);
  });

  test('should handle custom IDs', () => {
    const customId = "custom-id-123";
    const nft = db.createMetadata({ id: customId, name: "Custom ID NFT" });
    
    expect(nft.id).toBe(customId);
    expect(db.getMetadata(customId)).toEqual(nft);
    
    // Попытка создать дубликат
    const nft2 = db.createMetadata({ id: customId, name: "Duplicate" });
	expect(nft2.id).toMatch(/^nft-\d+$/); // Verify format
    expect(nft2.id).not.toBe(customId);
  });

  test('should handle partial updates', () => {
    const nft = db.createMetadata({
      name: "Original Name",
      description: "Original Description",
      owner: "0xOriginal"
    });
    
    // Обновляем только описание
    const updated = db.updateMetadata(nft.id, { 
      description: "Updated Description" 
    });
    
    expect(updated.name).toBe("Original Name");
    expect(updated.description).toBe("Updated Description");
    expect(updated.owner).toBe("0xOriginal");
  });

  test('should maintain data integrity', () => {
    const nft = db.createMetadata({
      owner: "0x1",
      collection: "C1",
      attributes: [{ trait: "color", value: "blue" }]
    });
    
    // Обновляем несколько полей
    const updated = db.updateMetadata(nft.id, {
      owner: "0x2",
      attributes: [{ trait: "color", value: "red" }]
    });
    
    // Проверяем обновленные поля
    expect(updated.owner).toBe("0x2");
    expect(updated.attributes[0].value).toBe("red");
    
    // Проверяем неизмененные поля
    expect(updated.collection).toBe("C1");
    
    // Проверяем индексы
    expect(db.getByOwner("0x1")).toHaveLength(0);
    expect(db.getByOwner("0x2")).toHaveLength(1);
    expect(db.getByCollection("C1")).toHaveLength(1);
  });
});