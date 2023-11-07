## Project Structure
this is a monorepo project, using [pnpm](https://pnpm.io/) as package manager.
```
.
├── README.md
├── apps
│   ├── server       // nodejs rest api server
│   └── web          // vue.js3 frontend
└── packages
    └── sql-parser   // sql parser
        ├── __test__ // test file
        └── bin      // binary file
```

## Usage
1. Install Pnpm
2. `pnpm i`
### Dockerfile
pnpm workspace has some package dependency issue for deploy. Not work yet, I'm still doing research. But if not using pnpm workspace, it will works fine.
### Sql parser(nodejs)
You will need to install bun to start dev. Some EsModule Issue not solved yet.  
`pnpm sql-parser:start` to start dev.   
Or you can just execute binary in `./packages/sql-parser/bin`, than input your sql. exit by `ctrl + c`.

I use pkg to package the binary, so you can also use `pnpm sql-parser:build` to build binary for your platform. At first I want to use bun but it doesn't support cross platform. So I use pkg instead.

### Start Api Server(nodejs)
`pnpm server:start`
Server will start at `3000` port, ensure it's not occupied.

### Start Web(Vue.js 3)
`pnpm web:start`
Web will start at `8080` port, ensure it's not occupied.

## Why Nodejs?
My current main tech of backend is Nodejs & Golang. I think using Nodejs to deal with data parse/data structure has better DX than Golang. And also could put all things in one monorepo easily.

## TODO
#### Sql Parser
- [ ] `Error handling & logging`
- [ ] `SQL Input validation`: The current code directly reads the user input SQL string and processes it without any form of validation or sanitization. It could incorporate checks for the format and content of the SQL string to prevent SQL injection or other security issues.
- [ ] `More Edge Cases`: Ensure that the tests cover a variety of edge cases, such as null values, unusually long query strings, and special characters.
- [ ] `Performance Testing`: Performance testing could be considered to ensure that the parser can effectively handle large queries.  
#### Server
- [ ] If there isn't other requirement, maybe could use key-value database instead of relation one.
- [ ] `Server Api Doc`: Using `openapi` to document the rest api.
- [ ] Column Name should hash with table name? 
- [ ] ...
#### Web
- [ ] Fix codemirror syntax highlight issue.

## Instructions for deploying the app on AWS
### Backend
- build docker image and upload to `ECR`
- create task definition of `ECS`
- deploy fargate service with task definition
- setting application load balancer 
- database: `RDS` or `DynamoDB`
### Frontend
- upload to `S3` bucket
- upload ssl certificate to `ACM` or directly using `ACM`
- setting `CloudFront` to serve static files