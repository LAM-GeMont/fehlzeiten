# Fehlzeitenerfassung

This is the repository for the absence-tracking sub-project. It is implemented as a backend-frontend application with GraphQL as the communication layer between both.

## Development

### Backend
For development, you should first clone this github repository. Node.js >14.0 and a package manager, eg. npm or yarn, is required. You will need to run to seperate projects. The Backend is located in the /server folder and serves the API for the data layer. Initially you will need to install the required packages using your package manager (`npm install` for npm). Run it for development by opening two terminals and running

```bash
npm run watch
```
and
```bash
npm run dev
```

This will ensure that your code is continually compiled from Typescript to Javascript as you change it and restarts the application if anything changes.

### Frontend
To develop on the frontend, navigate into the /web folder. Install the packages here and then run
```bash
npm run dev
```
The frontend will now be running and will update whenever you change the code.

If you change anything related to the graphql files, you will need to run graphql-codegen again. The command for this is `npm run codegen`.


## Deployment
To run the project in production, first start the backend server located in /server. To do so, run

```bash
npm run build
npm run start
```

The API of the application will now be running on port 4000.

Next, you should start the Next.js Server powering the web application. For this, go into the /web folder and run

```bash
npm run build
npm run start
```

The Application should now be fully functional and can be accessed on port 3000.

