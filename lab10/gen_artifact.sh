#!/bin/bash
CONTRACT_NAME="EduchainStaking"
CONTRACT_FILE="contracts/$CONTRACT_NAME.sol"
OUT_DIR="out/$CONTRACT_NAME.sol"

# Создаем директорию
mkdir -p "$OUT_DIR"

# Получаем ABI и байткод
ABI=$(forge inspect "$CONTRACT_FILE" abi)
BYTECODE=$(forge inspect "$CONTRACT_FILE" bytecode)

# Создаем JSON-артефакт
ARTIFACT_JSON=$(jq -n \
  --argjson abi "$ABI" \
  --arg bytecode "$BYTECODE" \
  '{abi: $abi, bytecode: $bytecode}')

# Сохраняем в файл
echo "$ARTIFACT_JSON" > "$OUT_DIR/$CONTRACT_NAME.json"
echo "Artifact generated at $OUT_DIR/$CONTRACT_NAME.json"
