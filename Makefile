SERVICE_DIR=mentra-asuka-g1

.PHONY: dev build start docker docker-up render railway

dev:
	cd $(SERVICE_DIR) && npm ci && npm run build && node dist/index.js

build:
	cd $(SERVICE_DIR) && npm ci && npm run build

start:
	cd $(SERVICE_DIR) && node dist/index.js

docker:
	docker build -t asuka-mentra-g1 .

docker-up:
	docker compose up -d --build

render:
	# Deploy on Render.com, it will auto-detect render.yaml

railway:
	railway up
