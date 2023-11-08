import { Statement } from 'pgsql-ast-parser'
import { modifyAst, rebuildSql, sqlToAst } from './src/parser'

export function sqlParse(
  sqlString: string,
  hashMapToCompare: Record<
    /** originalColumnName */ string,
    /** hashedColumnName */ string
  >
) {
  try {
    const ast = sqlToAst(sqlString)
    const modified = modifyAst(ast, hashMapToCompare)
    const modifiedSql = rebuildSql(modified.ast)
    return {
      sqlInput: sqlString,
      sqlParsed: modifiedSql,
      hashMap: modified.hashMap,
    }
  } catch (error) {
    console.log('An error occurred:', error)
    throw error
  }
}

export type { Statement }
export { sqlToAst, modifyAst, rebuildSql }
