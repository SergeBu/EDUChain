class FakeNFTDatabase {
  constructor() {
    this.metadata = new Map(); // Основное хранилище: ID -> Metadata
    this.byOwner = new Map();  // Индекс по владельцам: owner -> Set<ID>
    this.byCollection = new Map(); // Индекс по коллекциям: collection -> Set<ID>
    this.nextId = 1; // Счетчик для автоинкремента ID
  }

  /**
   * Создает новую запись метаданных
   * @param {Object} metadata - Объект метаданных NFT
   * @param {string} [metadata.id] - Опциональный ID (иначе сгенерируется)
   * @returns {Object} Созданные метаданные с ID
   */
  createMetadata(metadata) {
     // Check for duplicate ID before assignment
  let id = metadata.id;
  if (id && this.metadata.has(id)) {
    id = undefined; // Force new ID generation if duplicate
  }
  
  id = id || `nft-${this.nextId++}`;
  const fullMetadata = {
      ...metadata,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Сохраняем в основном хранилище
    this.metadata.set(id, fullMetadata);

    // Обновляем индекс по владельцам
    if (fullMetadata.owner) {
      this._addToIndex(this.byOwner, fullMetadata.owner, id);
    }

    // Обновляем индекс по коллекциям
    if (fullMetadata.collection) {
      this._addToIndex(this.byCollection, fullMetadata.collection, id);
    }

    return fullMetadata;
  }

  /**
   * Получает метаданные по ID
   * @param {string} id - ID NFT
   * @returns {Object|null} Метаданные или null если не найдены
   */
  getMetadata(id) {
    return this.metadata.get(id) || null;
  }

  /**
   * Обновляет метаданные
   * @param {string} id - ID NFT
   * @param {Object} updates - Обновляемые поля
   * @returns {Object|null} Обновленные метаданные или null если не найдены
   */
  updateMetadata(id, updates) {
    const existing = this.metadata.get(id);
    if (!existing) return null;

    // Удаляем из индексов перед обновлением
    this._removeFromIndex(this.byOwner, existing.owner, id);
    this._removeFromIndex(this.byCollection, existing.collection, id);

    // Применяем обновления
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Сохраняем обновленные данные
    this.metadata.set(id, updated);

    // Обновляем индексы
    if (updated.owner) {
      this._addToIndex(this.byOwner, updated.owner, id);
    }

    if (updated.collection) {
      this._addToIndex(this.byCollection, updated.collection, id);
    }

    return updated;
  }

  /**
   * Удаляет метаданные
   * @param {string} id - ID NFT
   * @returns {boolean} Успешно ли удалено
   */
  deleteMetadata(id) {
    const metadata = this.metadata.get(id);
    if (!metadata) return false;

    // Удаляем из основного хранилища
    this.metadata.delete(id);

    // Удаляем из индексов
    this._removeFromIndex(this.byOwner, metadata.owner, id);
    this._removeFromIndex(this.byCollection, metadata.collection, id);

    return true;
  }

  /**
   * Получает все NFT для владельца
   * @param {string} owner - Адрес владельца
   * @returns {Array} Массив NFT метаданных
   */
  getByOwner(owner) {
    return this._getFromIndex(this.byOwner, owner);
  }

  /**
   * Получает все NFT в коллекции
   * @param {string} collection - Идентификатор коллекции
   * @returns {Array} Массив NFT метаданных
   */
  getByCollection(collection) {
    return this._getFromIndex(this.byCollection, collection);
  }

  /**
   * Получает все метаданные
   * @returns {Array} Все NFT метаданные
   */
  getAllMetadata() {
    return Array.from(this.metadata.values());
  }

  /**
   * Очищает базу данных (для тестов)
   */
  reset() {
    this.metadata.clear();
    this.byOwner.clear();
    this.byCollection.clear();
    this.nextId = 1;
  }

  // Вспомогательные методы для работы с индексами
  _addToIndex(indexMap, key, value) {
    if (!key) return;
    if (!indexMap.has(key)) {
      indexMap.set(key, new Set());
    }
    indexMap.get(key).add(value);
  }

  _removeFromIndex(indexMap, key, value) {
    if (!key || !indexMap.has(key)) return;
    const indexSet = indexMap.get(key);
    indexSet.delete(value);
    if (indexSet.size === 0) {
      indexMap.delete(key);
    }
  }

  _getFromIndex(indexMap, key) {
    if (!indexMap.has(key)) return [];
    return Array.from(indexMap.get(key))
      .map(id => this.metadata.get(id))
      .filter(Boolean);
  }
}

module.exports = FakeNFTDatabase;