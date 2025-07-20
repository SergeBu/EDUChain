#!/bin/bash
CONTRACT_NAME="EduchainStaking"
CONTRACT_FILE="contracts/.sol"
OUT_DIR="out/.sol"

mkdir -p 

forge inspect  abi > /.json
forge inspect  bytecode >> /.json
echo "Artifact generated at /.json"
