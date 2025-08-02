const { v4: uuidv4 } = require('uuid');

class MoodleServiceMock {
  constructor() {
    // Инициализация тестовых данных
    this.users = [
      { id: 101, email: 'student1@university.edu', role: 'student', courses: [201] },
      { id: 102, email: 'professor@university.edu', role: 'editingteacher', courses: [201, 202] },
    ];
    
    this.courses = [
      { id: 201, name: 'Blockchain Fundamentals', completions: [101] },
      { id: 202, name: 'Smart Contract Development', completions: [] },
    ];
    
    this.events = [];
    this.token = 'mock_moodle_token_' + uuidv4();
  }

  // Эмуляция аутентификации в Moodle
  authenticate(username, password) {
    const user = this.users.find(u => u.email === username);
    
    if (!user || password !== 'valid_password') {
      throw new Error('Invalid credentials');
    }
    
    return {
      token: this.token,
      userid: user.id,
    };
  }

  // Мок для проверки токена
validateToken(token) {
  return token === this.token;
}

getCourse(courseId) {
  const course = this.courses.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  return {
    ...course,
    enrolledUsers: this.users.filter(u => u.courses.includes(courseId))
  };
}

  // Эмуляция события завершения курса
  triggerCourseCompletion(userId, courseId) {
    const course = this.courses.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (!course.completions.includes(userId)) {
      course.completions.push(userId);
      this.events.push({
        id: uuidv4(),
        type: 'course_completed',
        user: userId,
        course: courseId,
        time: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      eventId: this.events[this.events.length - 1].id
    };
  }

  // Получение событий
  getEvents(since = null) {
    return since 
      ? this.events.filter(e => new Date(e.time) > new Date(since))
      : [...this.events];
  }

  // Метод для тестов - сброс состояния
  reset() {
    this.courses[0].completions = [101];
    this.courses[1].completions = [];
    this.events = [];
  }
}

module.exports = MoodleServiceMock;