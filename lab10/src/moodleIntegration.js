const crypto = require('crypto');

class EDUChainMoodleIntegration {
  constructor(options) {
    this.moodleService = options.moodleService;
    this.moodleUrl = options.moodleUrl;
    this.webhookSecret = options.webhookSecret || 'default_secret';
    this.authToken = null;
    this.userId = null;
  }

  async authenticate(username, password) {
    const authResult = await this.moodleService.authenticate(username, password);
    this.authToken = authResult.token;
    this.userId = authResult.userid;
    return authResult;
  }

  async completeCourse(courseId) {
    if (!this.authToken) throw new Error('Authentication required');
    
    const course = await this.moodleService.getCourse(courseId);
    if (course.completions.includes(this.userId)) {
      return {
        success: true,
        nftMinted: false,
        message: `Course already completed by user ${this.userId}`
      };
    }

    await this.moodleService.triggerCourseCompletion(this.userId, courseId);
    return {
      success: true,
      nftMinted: true,
      courseName: course.name
    };
  }

  async syncRecentEvents() {
    const events = await this.moodleService.getEvents();
    const results = {
      syncedEvents: 0,
      mintedNFTs: 0,
      errors: 0
    };

    for (const event of events) {
      if (event.type === 'course_completed') {
        results.syncedEvents++;
        try {
          // Здесь должна быть логика минта NFT
          results.mintedNFTs++;
        } catch (error) {
          results.errors++;
        }
      }
    }

    return results;
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  verifyWebhook(payload, signature) {
    return this.generateSignature(payload) === signature;
  }
}

module.exports = { EDUChainMoodleIntegration };