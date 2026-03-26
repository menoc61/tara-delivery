#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="tara-delivery"
PROJECT_DIR="/var/www/${APP_NAME}"
REPO_URL="https://github.com/menoc61/Agence___LIvraison.git"
BRANCH="main"
DOMAIN="api.englishlanguagecertificate.com"
HEALTH_URL="https://${DOMAIN}/health"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_root() {
  if [ "${EUID}" -ne 0 ]; then
    log "Run this script as root or with sudo."
    exit 1
  fi
}

install_dependencies() {
  log "Installing base dependencies if missing..."
  apt-get update -y
  apt-get install -y git curl ca-certificates

  if ! command -v docker >/dev/null 2>&1; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
  fi

  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    log "Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
    COMPOSE=(docker compose)
  fi
}

prepare_repo() {
  log "Preparing project directory..."
  mkdir -p "$PROJECT_DIR"
  cd "$PROJECT_DIR"

  if [ ! -d ".git" ]; then
    log "Cloning repository..."
    git clone --branch "$BRANCH" "$REPO_URL" .
  else
    log "Updating repository..."
    git fetch origin "$BRANCH"
    git reset --hard "origin/${BRANCH}"
    git clean -fd
  fi
}

build_and_deploy() {
  log "Stopping existing containers..."
  "${COMPOSE[@]}" -f "$PROJECT_DIR/docker-compose.yml" down --remove-orphans || true

  log "Building and starting containers..."
  "${COMPOSE[@]}" -f "$PROJECT_DIR/docker-compose.yml" up -d --build --remove-orphans

  log "Removing dangling images..."
  docker image prune -f >/dev/null 2>&1 || true
}

health_check() {
  log "Waiting for API health check..."
  for i in $(seq 1 30); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      log "API is healthy at ${HEALTH_URL}"
      return 0
    fi
    sleep 5
  done

  log "Health check failed. Showing recent logs:"
  "${COMPOSE[@]}" -f "$PROJECT_DIR/docker-compose.yml" logs --tail=80 api || true
  exit 1
}

main() {
  require_root
  install_dependencies
  prepare_repo
  build_and_deploy
  health_check

  log "Deployment complete."
  log "Backend should now be reachable through https://${DOMAIN}"
}

main "$@"