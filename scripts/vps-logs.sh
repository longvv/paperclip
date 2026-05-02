#!/usr/bin/env bash
ssh root@178.105.29.2 'docker compose -f /opt/paperclip/docker-compose.yml logs -f'
