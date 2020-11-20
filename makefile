up:
	docker-compose up

down:
	docker-compose down

run-test:
	docker container exec sroc-charging-module-api_api_1 npm run unit-test

clean:
	docker image rm sroc-charging-module-api_api

seed:
	docker container exec sroc-charging-module-api_api_1 npx knex seed:run
