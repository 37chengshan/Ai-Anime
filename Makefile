.PHONY: dev build test lint clean install

install:
	pnpm install

dev:
	pnpm dev

dev:web:
	pnpm dev:web

dev:api:
	pnpm dev:api

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

format:
	pnpm format

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf .next apps/*/.next
	rm -rf dist apps/*/dist packages/*/dist
	rm -rf __pycache__ apps/*/__pycache__
	find . -name "*.pyc" -delete

db:migrate:
	cd apps/api && alembic revision --autogenerate -m "$(msg)"

db:upgrade:
	cd apps/api && alembic upgrade head

db:downgrade:
	cd apps/api && alembic downgrade -1

docker:up:
	docker compose up -d

docker:down:
	docker compose down

docker:logs:
	docker compose logs -f
