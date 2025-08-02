const EmailServiceStub = require('../services/EmailServiceStub');

describe('EmailServiceStub', () => {
  let emailService;

  beforeEach(() => {
    // Создаем новый экземпляр стаба перед каждым тестом
    emailService = new EmailServiceStub();
  });

  afterEach(() => {
    // Очищаем историю после каждого теста
    emailService.clearSentEmails();
  });

  // Тест 1: Базовая отправка email
  test('should send email and store it in history', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'This is a test email'
    };

    const result = await emailService.sendEmail(emailData);
    
    // Проверяем результат отправки
    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/stub-/);
    expect(result.timestamp).toBeDefined();
    
    // Проверяем историю отправки
    const sentEmails = emailService.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]).toEqual({
      ...emailData,
      timestamp: expect.any(String)
    });
  });

  // Тест 2: Поиск писем по получателю
  test('should find emails by recipient', async () => {
    await emailService.sendEmail({
      to: 'student@university.edu',
      subject: 'Grades',
      text: 'Your grade is A+'
    });
    
    await emailService.sendEmail({
      to: 'professor@university.edu',
      subject: 'Meeting',
      text: 'Faculty meeting at 3PM'
    });
    
    await emailService.sendEmail({
      to: 'student@university.edu',
      subject: 'Assignment',
      text: 'Submit your assignment by Friday'
    });
    
    // Ищем письма для студента
    const studentEmails = emailService.findEmailsTo('student@university.edu');
    expect(studentEmails).toHaveLength(2);
    expect(studentEmails[0].subject).toBe('Grades');
    expect(studentEmails[1].subject).toBe('Assignment');
    
    // Ищем письма для профессора
    const professorEmails = emailService.findEmailsTo('professor@university.edu');
    expect(professorEmails).toHaveLength(1);
    expect(professorEmails[0].text).toContain('Faculty meeting');
    
    // Проверяем поиск несуществующего получателя
    const unknownEmails = emailService.findEmailsTo('unknown@example.com');
    expect(unknownEmails).toHaveLength(0);
  });

  // Тест 3: Очистка истории
  test('should clear sent emails history', async () => {
    await emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello'
    });
    
    expect(emailService.getSentEmails()).toHaveLength(1);
    
    emailService.clearSentEmails();
    expect(emailService.getSentEmails()).toHaveLength(0);
  });

  // Тест 4: Имитация сбоя сервиса
  test('should simulate service failure', async () => {
    emailService.simulateFailure();
    
    await expect(
      emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Failure',
        text: 'This should fail'
      })
    ).rejects.toThrow('Email service unavailable');
    
    // Проверяем, что письмо не было сохранено
    expect(emailService.getSentEmails()).toHaveLength(0);
  });

  // Тест 5: Восстановление работы после сбоя
  test('should restore service after failure', async () => {
    // Вызываем сбой
    emailService.simulateFailure();
    await expect(emailService.sendEmail({})).rejects.toThrow();
    
    // Восстанавливаем сервис
    emailService.restoreService();
    
    const result = await emailService.sendEmail({
      to: 'recovered@example.com',
      subject: 'Service Restored',
      text: 'Back online!'
    });
    
    expect(result.success).toBe(true);
    expect(emailService.getSentEmails()).toHaveLength(1);
  });

// ... предыдущие тесты без изменений ...

// Тест 6: Проверка обработки неполных данных
test('should handle incomplete email data', async () => {
  // Проверка отсутствия всех полей
  await expect(emailService.sendEmail({}))
    .rejects.toThrow('Missing required email fields');
  
  // Проверка отсутствия поля 'to'
  await expect(emailService.sendEmail({
    subject: 'Test',
    text: 'Content'
  })).rejects.toThrow('Missing required email fields');
  
  // Проверка отсутствия поля 'subject'
  await expect(emailService.sendEmail({
    to: 'test@example.com',
    text: 'Content'
  })).rejects.toThrow('Missing required email fields');
  
  // Проверка отсутствия поля 'text'
  await expect(emailService.sendEmail({
    to: 'test@example.com',
    subject: 'Test'
  })).rejects.toThrow('Missing required email fields');
  
  // Проверка пустых значений
  await expect(emailService.sendEmail({
    to: '',
    subject: 'Test',
    text: 'Content'
  })).rejects.toThrow('Missing required email fields');
  
  // Проверяем, что ничего не сохранилось
  expect(emailService.getSentEmails()).toHaveLength(0);
});

// Тест 10: Проверка корректной отправки с минимальными данными
test('should accept valid minimal email data', async () => {
  const validEmail = {
    to: 'valid@example.com',
    subject: 'Valid',
    text: 'Content'
  };
  
  await expect(emailService.sendEmail(validEmail))
    .resolves.toBeDefined();
  
  expect(emailService.getSentEmails()).toHaveLength(1);
});
});