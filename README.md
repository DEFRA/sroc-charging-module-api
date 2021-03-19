# SROC Charging Module API

![Build Status](https://github.com/DEFRA/sroc-charging-module-api/workflows/CI/badge.svg?branch=main)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_sroc-charging-module-api&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_sroc-charging-module-api)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_sroc-charging-module-api&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_sroc-charging-module-api)
[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/sroc-charging-module-api/badge.svg)](https://snyk.io/test/github/DEFRA/sroc-charging-module-api)
[![Licence](https://img.shields.io/badge/Licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

> A work in progress version 2 of the original [Charging Module API](https://github.com/DEFRA/charging-module-api)

This API provides an interface for calculating charges, queuing transactions and generating transaction files used to produce invoices.

## Prerequisites

Make sure you already have:

- [Node.js v14.*](https://nodejs.org/en/)
- [PostgreSQL v12](https://www.postgresql.org/)

## Installation

First clone the repository and then drop into your new local repo:

```bash
git clone https://github.com/DEFRA/sroc-charging-module-api.git && cd sroc-charging-module-api
```

Our preference is to run the database and API within Docker, so [install Docker](https://docs.docker.com/get-docker/) if you don't already have it.

## Configuration

Any configuration is expected to be driven by environment variables when the service is run in production as per [12 factor app](https://12factor.net/config).

However when running locally in development mode or in test it makes use of the [Dotenv](https://github.com/motdotla/dotenv) package. This is a shim that will load values stored in a `.env` file into the environment which the service will then pick up as though they were there all along.

Check out [.env.example](/.env.example) for details of the required things you'll need in your `.env` file.

Refer to the [config files](config) for details of all the configuration used.

## Docker

As [Docker](https://www.docker.com/) is our chosen solution for deploying and managing the app in production we also use it for local development. The following will get an environment up and running quickly ready for development. It assumes 2 things

- you have Docker installed
- you are using [VSCode](https://code.visualstudio.com/) for development

### Initial build

Open the project in VSCode and then use the [Command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) to access the tasks we have provided in [tasks.json](.vscode/tasks.json)

With the palette open search for **Run test task** and once highlighted select it. From the list that's presented select **Start sroc-cma environment**

You should see a new terminal open up and [Docker Compose](https://docs.docker.com/compose/) begin to start building the images. Once that is done it will switch to running the API in docker.

### Prep the database

The database is automatically created but you still need to run migrations and seed it. Again using the command palette and the **Run test task** option, find and select in turn

- **Run sroc-cma dev migrations**
- **Run sroc-cma dev seeds**

The API should now be ready to use.

### Prep for testing

Before we can run any tests the 'test' database needs to be created and migrations run against it. Using the command palette and the **Run test task** option, find and select

- **Prepare sroc-cma test db**

This will both create the test database and run migrations against it. It is also safe to run repeatedly should you need to run new migrations.

### Non-vscode users

If you are not a VSCode user it does not mean you cannot use Docker. Refer to [tasks.json](.vscode/tasks.json) for the commands being run and implement them in your preferred tool.

## Testing the app

To run lint checks use the command palette and the **Run test task** option to find and select

- **Run sroc-cma lint checks**

To run unit tests find and select

- **Run sroc-cma unit tests**

Check out the `scripts` in [package.json](package.json) if you intend to run things locally.

## Contributing to this project

If you have an idea you'd like to contribute please log an issue.

All contributions should be submitted via a pull request.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
