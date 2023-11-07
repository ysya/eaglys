## Project Structure
```
.
├── README.md
├── apps
│   ├── server // nodejs rest api server
│   └── web // vue.js3 frontend
└── packages
    └── sql-parser // sql parser

```

## Usage
1. Install Pnpm
2. Install Bun
3. `pnpm i`

### Start Sql parser
`pnpm sql-parser:start` to start dev. 
Or you can just execute binary in `./packages/sql-parser/bin`, than input your sql. exit by `ctrl + c`

### Start Server
`pnpm server:start`
Server will start at `3000` port, ensure it's not occupied.

### Start Web
`pnpm web:start`
Web will start at `8080` port, ensure it's not occupied.

## Why Nodejs?
My current main tech of backend is Nodejs & Golang. I think using Nodejs to deal with data parse/data structure has better DX than Golang.

### TODO
#### Sql Parser
- [ ] `Error handling & logging`
- [ ] `SQL Input validation`: The current code directly reads the user input SQL string and processes it without any form of validation or sanitization. It could incorporate checks for the format and content of the SQL string to prevent SQL injection or other security issues.
- [ ] `Edge Cases`: Ensure that the tests cover a variety of edge cases, such as null values, unusually long query strings, and special characters.
- [ ] `Performance Testing`: Performance testing could be considered to ensure that the parser can effectively handle large queries.  
#### Server
- [ ] If there isn't other requirement, maybe could use key-value database instead of relation one.
- [ ] `Server Api Doc`: Using `openapi` to document the rest api.
- [ ] Column Name should hash with table name? 
- [ ] ...