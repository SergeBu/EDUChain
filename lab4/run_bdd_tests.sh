#!/bin/bash
set -e

# Запуск Anvil
anvil > anvil.log 2>&1 &
ANVIL_PID=$!
echo "Anvil запущен с PID $ANVIL_PID"

# Ожидание инициализации Anvil
echo "Ожидание запуска Anvil..."
sleep 5

# Компиляция контрактов с очисткой кэша
echo "Компиляция контрактов..."
forge clean && forge build --offline || {
  echo "Ошибка компиляции";
  kill $ANVIL_PID;
  exit 1;
}

# Запуск тестов
echo "Запуск BDD-тестов..."
npx cucumber-js features/educhain_staking.feature \
  --require-module @babel/register \
  --require features/step_definitions/educhain_staking_steps.js \
  --format progress || {
    echo "Тесты провалились";
    kill $ANVIL_PID;
    exit 1;
  }

# Остановка Anvil
echo "Остановка Anvil..."
kill $ANVIL_PID
echo "Anvil остановлен"