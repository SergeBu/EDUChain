class EmailServiceStub {
  constructor() {
    this.sentEmails = [];
    this.serviceAvailable = true;
  }

  async sendEmail({ to, subject, text }) {
    // Проверяем обязательные поля
    if (!to || !subject || !text) {
      throw new Error('Missing required email fields');
    }

    if (!this.serviceAvailable) {
      throw new Error('Email service unavailable');
    }

    const emailRecord = {
      to,
      subject,
      text,
      timestamp: new Date().toISOString()
    };
    
    this.sentEmails.push(emailRecord);
    
    return {
      success: true,
      messageId: `stub-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: emailRecord.timestamp
    };
  }

  // Остальные методы без изменений
  getSentEmails() {
    return [...this.sentEmails];
  }

  findEmailsTo(email) {
    return this.sentEmails.filter(msg => msg.to === email);
  }

  clearSentEmails() {
    this.sentEmails = [];
  }

  simulateFailure() {
    this.serviceAvailable = false;
  }

  restoreService() {
    this.serviceAvailable = true;
  }
}

module.exports = EmailServiceStub;