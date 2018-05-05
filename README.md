# Welcome to the id-workshop

This repo contains exercises for my workshop called _Identity in modern Web applications_. The workshop will be delivered at [infoShare 2018](https://infoshare.pl/workshops/).

# Prerequisites

The following software is required to go through the exercises:

- Node.js 8.x or later
- Text editor :)

# Running exercises

Each of the three exercises has a separate copy of the source code:

```bash
$ cd exercise-01
```

If you start the application for the first time, you need to install dependencies first:

```bash
$ npm install
```

Now you should be ready to start the application:

```bash
$ npm start
```

Now open `http://localhost:3000` in your Web browser and verify that the application works.

# Troubleshooting

## Health check

The application has a health check page at `http://localhost:3000/check`. If everything works fine, you should see a big `OK!`. In case of an error, you'll get a full stack trace.

## Database reset

You might want to reset the database to a clean slate:

```bash
$ npm run dbreset
```
