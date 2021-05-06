# Carbonara Intern Assignment

This is a REST API implemented in NodeJS, using the **express.js** framework as the base.

## Start the server / Running unit tests

Install packages

```
npm install
```

Run unit tests

```
npm run test  --silent 
```

Start REST server (starts at `localhost:3000/` by default)

```bash
# for windows cmd.exe:
set DEBUG=* & npm start
# alternatively
npm run devstart
```

## Usage

Two paths used by the REST API:

- `/` - The waitlist. Add, remove, index customers at this path
- `/limit` - Controls the waitlist size-limit

Adding customers:

- Provide the `name` and `phone`

```
> curl localhost:3000/ -d "name=Hello&phone=12345"
{"name":"Hello","phone":"12345","index":0}
> curl localhost:3000/ -d "name=World&phone=56789"
{"name":"World","phone":"56789","index":1}
> curl localhost:3000/ -d "name=!!!&phone=abcde"
{"name":"!!!","phone":"abcde","index":2}
```

Listing all customers (Showing the waitlist):

```
> curl localhost:3000/
[{"name":"Hello","phone":"12345","index":0},{"name":"World","phone":"56789","index":1},{"name":"!!!","phone":"abcde","index":2}]
```

Removing customers:

- Provide the list `index`

```
> curl localhost:3000/ -X DELETE -d index=0
{"name":"Hello","phone":"12345","index":0}
> curl localhost:3000/ -X DELETE -d index=999
{"error":"NoCustomerError","message":"No customer with index 999 found."}
```

Getting and setting waitlist limit:

```
> curl localhost:3000/limit
[0]
> curl localhost:3000/limit -d limit=5
[5]
```

Testing waitlist limit:

```
> curl localhost:3000/ -d "name=filler&phone=filler"
{"name":"filler","phone":"filler","index":2}
> curl localhost:3000/ -d "name=filler&phone=filler"
{"name":"filler","phone":"filler","index":3}
> curl localhost:3000/ -d "name=filler&phone=filler"
{"name":"filler","phone":"filler","index":4}
> curl localhost:3000/ -d "name=filler&phone=filler"
{"error":"WaitlistLimitError","message":"Adding customer exceeds waitlist limit of 5."}
```

## Project structure

- /bin - express.js boilerplate code
- /db - backends for databases
    - /db/sequelize - Database backend using the Sequelize module
    - /db/native - Fake database using an array, used before sequelize backend was complete
    - /db/index.js - Controls which backend to use
- /routes - handles routing for the application
- /test - unit tests, run with `npm run test  --silent`
- app.js - express.js configuration


## Known bugs

### Customers added simultaneously have ambiguous ordering.

The sequelize backend uses the `createdAt` attribute to sort customers by insertion order. If several customers are added simultaneously (within the same milisecond), they have the same `createdAt` time and may be ordered incorrectly.

The native backend does not suffer from this problem.