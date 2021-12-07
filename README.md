# Fehlzeitenerfassung

This is the repository for the `fehlzeiten` project (absence-tracking). It is implemented as a backend-frontend application with GraphQL as the communication layer between both.

## Development

### Backend

For development, you should first clone this Github repository.
Node.js >14.0 and a package manager, eg. npm or yarn, is required.
The Backend is located in the `server/` folder and serves the API for the data layer.
Initially you will need to install the required packages using your package manager (`npm install` for npm).

You should also create a `.env` file matching the example given. Provide values for all variables, as otherwise the application won't work.
For local development you should provide just any value for the oauth variables.

Run it for development by opening two terminals and running

```bash
npm run watch
```
in the first and

```bash
npm run dev
```
in the second terminal.

This will ensure that your code is continually transpile from Typescript to Javascript as you change it and restarts the application if anything changes.

### Frontend

To develop on the frontend, navigate into the `web/` folder. Install the packages here (`npm install`), then run

```bash
# backend server must be running while executing the following command
npm run codegen
```

for the initial setup and

```bash
npm run dev
```

to start the web application.

The frontend will now be running and will update whenever you change the code.

If you change anything related to the graphql files (`web/src/graphql/`), you will need to run `graphql-codegen` again (backend server must be running at this time). The command for this is `npm run codegen`.

## Deployment

To run the project in production, first start the backend server located in `server/`. To do so, create a copy of the `.env.example` as `.env` and adjust the values, then run

```bash
npm run build
npm run start
```

The API of the application will now be running on port `4000`.

Next, you should start the Next.js Server powering the web application. For this, go into the `web/` folder and run

```bash
npm run codegen
npm run build
npm run start
```

The Application should now be fully functional and can be accessed on port `3000`.

## Docs

The following must happen in the `docs` folder.

### Setup

1. install [Jekyll](https://jekyllrb.com/docs/installation/)
2. download the theme locally with
    ```bash
    gem install just-the-docs
    ```

### Develop

```bash
jekyll serve --port 4001 --livereload
```
