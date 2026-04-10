#!/usr/bin/env bash
# Mata processos nas portas 3000 (Next) e 6006 (Storybook) e reinicia ambos.
# Next roda em foreground; Storybook roda em background com log em /tmp.
set -e

PORTS=(3000 6006)

for PORT in "${PORTS[@]}"; do
  echo "Procurando processos na porta $PORT..."
  PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "  Matando PIDs: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  else
    echo "  Nada rodando."
  fi
done

sleep 1

# Sobe a partir da raiz do projeto (pasta pai do diretório do script)
cd "$(dirname "$0")/.."

echo "Iniciando Storybook em background (log: /tmp/guitta-storybook.log)..."
nohup npm run storybook > /tmp/guitta-storybook.log 2>&1 &
echo "  PID: $!"

echo "Iniciando Next dev (foreground)..."
exec npm run dev
