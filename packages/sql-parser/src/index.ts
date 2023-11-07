import { Statement } from 'pgsql-ast-parser'
import { modifyAst, rebuildSql, sqlToAst } from './parser'

export function sqlParse(sqlString: string) {
  const hashMap: Record<
    /** originalColumnName */ string,
    /** hashedColumnName */ string
  > = {}
  try {
    const ast = sqlToAst(sqlString)
    const modifiedAst = modifyAst(ast, hashMap) as Statement[]
    const modifiedSql = rebuildSql(modifiedAst)
    return { sqlInput: sqlString, sqlParsed: modifiedSql, hashMap }
  } catch (error) {
    console.log('An error occurred:', error)
    throw error
  }
}
