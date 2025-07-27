import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500']
  }
};

export default function () {
  // 1. Правильно определяем payload
  const payload = JSON.stringify({
    userId: `0x${__VU.toString(16).padStart(40, '0')}`,
    amount: 100
  });

  // 2. Добавляем параметры запроса
  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // 3. Отправляем запрос (исправленный синтаксис)
  const res = http.post(
    'http://host.docker.internal:3000/api/reward',
    payload,
    params
  );

  // 4. Проверяем результат
  check(res, {
    'status is 200': (r) => r.status === 200,
    'valid txHash': (r) => /^0x[a-f0-9]{64}$/.test(r.json().txHash)
  });
}