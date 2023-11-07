import { createHash } from 'crypto'
import {
  Statement,
  assignChanged,
  astMapper,
  parse,
  toSql,
} from 'pgsql-ast-parser'

function hashAndMap(
  originalColumnName: string,
  mapToCompare: Record<string, string>
) {
  if (mapToCompare[originalColumnName]) return mapToCompare[originalColumnName]
  const hashedColumnName = createHash('sha256')
    .update(originalColumnName)
    .digest('hex')
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
  let newHashMap: Record<string, string> = {}
  const result: Array<Statement | null | undefined> = []
  const mapper = astMapper(() => ({
    insert: (insert) => {
      if (!insert.columns) return insert
      insert.columns = insert.columns.map((column: any) => {
        const h = hashAndMap(column.name, hashMap)
        newHashMap = { ...newHashMap, [column.name]: h }
        column.name = h
        return column
      })
      return insert
    },
    column: (column: any) => {
      const h = hashAndMap(column.name, hashMap)
      newHashMap = { ...newHashMap, [column.name]: h }
      column.name = h

      return column
    },
    ref: (ref: any) => {
      const h = hashAndMap(ref.name, hashMap)
      newHashMap = { ...newHashMap, [ref.name]: h }
      return assignChanged(ref, {
        name: h,
      })
    },
    binary: (binary) => {
      if (binary.left.type === 'ref') {
        const h = hashAndMap(binary.left.name, hashMap)
        newHashMap = { ...newHashMap, [binary.left.name]: h }
        binary.left.name = h
      }
      if (binary.right.type === 'ref') {
        const h = hashAndMap(binary.right.name, hashMap)
        newHashMap = { ...newHashMap, [binary.right.name]: h }
        binary.right.name = h
      }
      return binary
    },
    set: (set) => {
      const h = hashAndMap(set.column.name, hashMap)
      newHashMap = { ...newHashMap, [set.column.name]: h }
      set.column.name = h
      return set
    },
  }))
  for (const statement of ast) {
    result.push(mapper.statement(statement))
  }
  return { ast: result as Statement[], hashMap: newHashMap }
}
