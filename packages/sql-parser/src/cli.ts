import * as readline from 'readline/promises'
import { sqlToAst, modifyAst, rebuildSql } from './parser'

async function main() {
  const hashMap: Record<
    /** originalColumnName */ string,
    /** hashedColumnName */ string
  > = {}
  // read line
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const sqlString = await rl.question('Please input a SQL:')
  try {
    const ast = sqlToAst(sqlString)
    const modifiedAst = modifyAst(ast, hashMap)
    const modifiedSql = rebuildSql(modifiedAst.ast)
    console.log('Input SQL:\n', sqlString, '\n')
    console.log('HashMap:\n', modifiedAst.hashMap, '\n')
    console.log('Modified Sql:\n', modifiedSql, '\n')
    console.log('----------------------------------\n')
    main()
  } catch (error) {
    console.log('An error occurred:', error)
    console.log('Please try entering the SQL again.')
    main()
  }
}

main()
