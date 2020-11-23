up:
	docker-compose up

down:
	docker-compose down

lint:
	docker container exec -it sroc-charging-module-api_api_1 npm run lint

migrate:
	docker container exec -it sroc-charging-module-api_api_1 npm run migratedb

migrate-test:
	docker container exec -it sroc-charging-module-api_api_1 npm run migratedbtest

run-test:
	docker container exec -it sroc-charging-module-api_api_1 npm run test

run-unit-test:
	docker container exec -it sroc-charging-module-api_api_1 npm run unit-test

clean:
	docker image rm sroc-charging-module-api_api

seed:
	docker container exec sroc-charging-module-api_api_1 npx knex seed:run
