import { createHash } from 'crypto'
import {
  Statement,
  assignChanged,
  astMapper,
  parse,
  toSql,
} from 'pgsql-ast-parser'

function hashAndMap(originalColumnName: string, map: Record<string, string>) {
  if (map[originalColumnName]) return map[originalColumnName]
  const hashedColumnName = createHash('sha256')
    .update(originalColumnName)
    .digest('hex')
  map[originalColumnName] = hashedColumnName
  return hashedColumnName
}

export function sqlToAst(sql?: string) {
  if (!sql) return []
  try {
    const ast = parse(sql)
    return ast
  } catch (error) {
    console.log(error)

    throw new SyntaxError("Invalid SQL syntax. Please check your SQL's syntax.")
  }
}

export function rebuildSql(modifiedAst: Statement[]) {
  let sqlString = ''
  for (const statement of modifiedAst) {
    sqlString += toSql.statement(statement) + ';\n'
  }
  return sqlString
}

export function modifyAst(ast: Statement[], hashMap: Record<string, string>) {
  const result: Array<Statement | null | undefined> = []
  const mapper = astMapper((map) => ({
    insert: (insert) => {
      if (!insert.columns) return insert
      insert.columns = insert.columns.map((column: any) => {
        const hashedColumnName = hashAndMap(column.name, hashMap)
        column.name = hashedColumnName
        return column
      })
      return insert
    },
    column: (column: any) => {
      column.name = hashAndMap(column.name, hashMap)
      return column
    },
    ref: (ref: any) =>
      assignChanged(ref, {
        name: hashAndMap(ref.name, hashMap),
      }),
    binary: (binary) => {
      if (binary.left.type === 'ref') {
        binary.left.name = hashAndMap(binary.left.name, hashMap)
      }
      if (binary.right.type === 'ref') {
        binary.right.name = hashAndMap(binary.right.name, hashMap)
      }
      return binary
    },
    set: (set) => {
      set.column.name = hashAndMap(set.column.name, hashMap)
      return set
    },
  }))
  for (const statement of ast) {
    result.push(mapper.statement(statement))
  }
  return result as Statement[]
}
