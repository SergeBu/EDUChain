const MoodleServiceMock = require('../src/moodleServiceMock');
const { EDUChainMoodleIntegration } = require('../src/moodleIntegration');

describe('Moodle LMS Integration', () => {
  let moodleMock;
  let integration;

  beforeEach(() => {
    // Создаем мок Moodle и интегратор
    moodleMock = new MoodleServiceMock();
    integration = new EDUChainMoodleIntegration({
      moodleUrl: 'http://mock-moodle',
      moodleService: moodleMock
    });
  });

  afterEach(() => {
    moodleMock.reset();
  });

  it('should authenticate with Moodle', async () => {
    const auth = await integration.authenticate('professor@university.edu', 'valid_password');
    expect(auth.token).toMatch(/mock_moodle_token/);
    expect(auth.userid).toBe(102);
  });

  it('should trigger NFT minting on course completion', async () => {
    // Аутентификация
    await integration.authenticate('student1@university.edu', 'valid_password');
    
    // Инициируем завершение курса
    const result = await integration.completeCourse(202);
    
    // Проверяем результаты
    expect(result.success).toBe(true);
    expect(result.nftMinted).toBe(true);
    expect(result.courseName).toBe('Smart Contract Development');
    
    // Проверяем, что событие было зарегистрировано
    const events = moodleMock.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('course_completed');
  });

  it('should handle course already completed', async () => {
    await integration.authenticate('student1@university.edu', 'valid_password');
    
    // Попытка завершить уже пройденный курс
    const result = await integration.completeCourse(201);
    
    expect(result.success).toBe(true);
    expect(result.nftMinted).toBe(false);
    expect(result.message).toContain('already completed');
  });

  it('should sync recent events', async () => {
    // Создаем событие до синхронизации
    moodleMock.triggerCourseCompletion(101, 202);
    
    // Синхронизируем события
    const syncResult = await integration.syncRecentEvents();
    
    expect(syncResult.syncedEvents).toBe(1);
    expect(syncResult.mintedNFTs).toBe(1);
    expect(syncResult.errors).toBe(0);
  });

  it('should validate webhook signature', async () => {
    const validPayload = {
      event: 'course_completed',
      user: 101,
      course: 201,
      timestamp: new Date().toISOString()
    };
    
    const signature = integration.generateSignature(validPayload);
    
    const isValid = integration.verifyWebhook(validPayload, signature);
    expect(isValid).toBe(true);
    
    // Невалидная подпись
    const invalidSignature = signature.replace('a', 'b');
    expect(integration.verifyWebhook(validPayload, invalidSignature)).toBe(false);
  });
});