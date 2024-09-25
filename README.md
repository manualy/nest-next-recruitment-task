# NestJS & NextJS recruitment task

The project aims to facilitate budget reporting through a NestJS API, enabling efficient management of creative and campaign data. IT was done as a job recruitment task.

## Status

- **Task 1** - done
- **Task 2** - done
- **Task 3** - done
- **Task 4** - halted

## How to initialize the app:

### Nest:

1. `cd nest-api`
2. Copy `.env*.sample` into `.env*` files.
3. `install` via yarn or npm (i use yarn)
4. run the `init:dev` script from `package.json`

### Next:

1. `cd next`
2. `install` via yarn or npm (i use yarn)

## Running the app in dev mode:

1. `docker compose build`
2. `docker compose up (add a --watch flag to enable hot-reload detection, -d for deamon mode)`

## How to run the seed script:

The dev docker container must be running in order for the script to work.

- `docker exec -it nest-api yarn run seed`

## Integration tests:

1. `cd nest-api`
2. `yarn test:integration`

## TASK DESCRIPTION:

Task preparation

1. Copy files campaigns.csv and creatives.csv to ./data/ directory
2. Start new nest project in the ./nest-api/ directory
3. Copy Dockerfile to the ./nest-api/ directory
4. Put docker-compose.yml file to the ./ directory
5. Create the ./job directory
6. Start docker compose
7. Verify if you can access your app http://localhost:3000/
8. Verify if you can access your database

Task 1
Write a script to populate creatives and campaigns data to the postgres tables.

1. It's preferred to use streams and do not insert more than 100 rows in one transaction.
2. Put the code into job folder.
3. You can configure a separate docker image to run the job.

Task 2
Configure nest environment

1. Configure Postgres connection
2. Configure GraphQL

Task 3
Design the GraphQL API to allow

1. Create, update entries in the Creatives and Campaigns tables
   Mutable Creatives columns: status, changed_date
   Mutable Campaigns columns: name, start_date, end_date, status, budget, creatives, changed_date
2. Add and remove existing creatives to the campaign
3. Generate budget report, based on the following parameters: start_date (required), end_date (required), status, creative_sizes, campaigns
4. Perform batch activation (status changes to ACTIVE) on campaigns and creatives

Task 4 (Extra task):
Prepare budget reporting visualization in NextJS

You are free to decide how the visualization looks like, but here go some hints.

1. Filters: date, status, campaigns by names
2. Aggregation options to be selected: monthly, weekly, daily
3. Metrics: budget
4. Dimensions: size, day, month, week number
