#!/bin/bash
set -e

# Запуск Anvil в фоне
anvil > anvil.log 2>&1 &
ANVIL_PID=$!
echo "Anvil запущен с PID $ANVIL_PID"

# Ждем инициализации
echo "Ожидание запуска Anvil..."
sleep 5

# Компиляция контрактов
echo "Компиляция контрактов..."
forge build --offline || { 
    echo "Ошибка компиляции"; 
    kill $ANVIL_PID;
    exit 1; 
}

# Запуск тестов Cucumber
echo "Запуск BDD-тестов..."
export NETWORK_URL="http://localhost:8545"
npx cucumber-js features || { 
        echo "Тесты провалились"; 
        kill $ANVIL_PID;
        exit 1; 
    }

# Остановка Anvil
echo "Остановка Anvil..."
if kill -0 $ANVIL_PID 2>/dev/null; then
  kill $ANVIL_PID
  echo "Anvil остановлен"
else
  echo "Anvil уже завершился"
fi
  