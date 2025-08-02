const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/reward', (req, res) => {
  console.log('Получен запрос:', req.body);
  res.json({ 
    txHash: '0x' + require('crypto').randomBytes(32).toString('hex')
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Доступен по сети: http://${require('os').hostname()}:${PORT}`);
});