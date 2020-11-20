up:
	docker-compose up

down:
	docker-compose down

setup:
	docker container exec sroc-charging-module-api_api_1 npm run createdb && npm run createdbtest

run-test:
	docker container exec sroc-charging-module-api_api_1 npm run unit-test

clean:
	docker image rm sroc-charging-module-api_api
