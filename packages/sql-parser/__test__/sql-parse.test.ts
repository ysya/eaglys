import { beforeEach, describe, expect, it } from 'vitest'
import { modifyAst, rebuildSql, sqlToAst } from '../src/parser'
import { createHash } from 'crypto'
import { Statement } from 'pgsql-ast-parser'

const testCase = {
  // Simple Test Cases
  select: 'SELECT a, b FROM test WHERE a = 5;',
  insert: `INSERT INTO users ("username", "password", "email", "created_at") VALUES ('john_doe', 'securepassword123', 'john.doe@example.com', NOW());`,
  update: `UPDATE users SET "username" = 'jane_doe' WHERE "id" = 1;`,
  delete: `DELETE FROM users WHERE "id" = 1;`,
  transaction: `START TRANSACTION;
                  UPDATE users
                  SET "email" = 'new.mail@example.com'
                  WHERE "username" = 'john_doe';
                  UPDATE users
                  SET "last_login" = NOW()
                  WHERE "username" = 'john_doe';
                  ROLLBACK;`,
  join: `SELECT "users"."username", "orders"."order_id"
          FROM "users"
          JOIN "orders"
          ON "users"."user_id" = "orders"."user_id"
          WHERE "users"."username" = 'john_doe';`,

  // Complex Where Test Cases
  multipleConditions:
    'SELECT * FROM "users" WHERE "age" > 25 AND "subscription_status" = \'active\' OR "signup_date" < CURRENT_DATE - INTERVAL \'1 year\';',
  // Aggregate Test Cases
  count: 'SELECT COUNT(*) FROM users;',
  // Alias Test Cases
}

// const aggregateTestCases = {
//   sum: 'SELECT SUM("order_total") FROM orders WHERE "created_at" > CURRENT_DATE - INTERVAL \'30 days\';',
//   avg: 'SELECT AVG("salary") FROM employee WHERE "department" = \'Sales\';',
//   max: 'SELECT MAX("login_time") FROM user_logins;',
//   min: 'SELECT MIN("login_time") FROM user_logins;',
//   groupBy: 'SELECT "department", COUNT(*) FROM employee GROUP BY "department";',
//   having:
//     'SELECT "department", COUNT(*) FROM employee GROUP BY "department" HAVING COUNT(*) > 5;',
// }
// const aliasTestCases = {
//   simpleAlias:
//     'SELECT "u"."username" AS "user_name", "u"."email" FROM "users" AS "u";',
//   tableAlias:
//     'SELECT "a"."name", "b"."name" FROM "authors" AS "a" JOIN "books" AS "b" ON "a"."id" = "b"."author_id";',
//   columnAliasInGroupBy:
//     'SELECT "department" AS "dept", COUNT(*) AS "emp_count" FROM employee GROUP BY "department";',
//   columnAliasInOrderBy:
//     'SELECT "username" AS "user", "email" AS "contact" FROM "users" ORDER BY "user";',
// }
// const complexWhereTestCases = {
//   subQuery:
//     'SELECT * FROM "users" WHERE "id" IN (SELECT "user_id" FROM "orders" WHERE "order_total" > 100);',
//   mixedOperators:
//     'SELECT * FROM "users" WHERE ("age" BETWEEN 30 AND 40) AND ("country" = \'US\' OR "country" = \'CA\');',
//   like: 'SELECT * FROM "users" WHERE "username" LIKE \'%doe\' AND "created_at" > \'2021-01-01\';',
//   nullCheck:
//     'SELECT * FROM "users" WHERE "terminated_date" IS NULL AND "status" = \'active\';',
//   joinsWithComplexWhere: `SELECT "u"."username", "p"."profile_pic"
//                           FROM "users" AS "u"
//                           JOIN "profiles" AS "p" ON "u"."id" = "p"."user_id"
//                           WHERE "u"."last_login" > CURRENT_DATE - INTERVAL '30 days'
//                           AND ("p"."profile_pic" IS NOT NULL OR "u"."status" = 'verified');`,
// }

function hash(params: string) {
  return createHash('sha256').update(params).digest('hex')
}

describe('should parse SQL to AST', () => {
  it(`select`, () => {
    const ast = sqlToAst(testCase.select)
    expect(ast[0].type).toBe('select')
  })
  it(`insert`, () => {
    const ast = sqlToAst(testCase.insert)
    expect(ast[0].type).toBe('insert')
  })
  it(`update`, () => {
    const ast = sqlToAst(testCase.update)
    expect(ast[0].type).toBe('update')
  })
  it(`delete`, () => {
    const ast = sqlToAst(testCase.delete)
    expect(ast[0].type).toBe('delete')
  })
  it(`transaction`, () => {
    const ast = sqlToAst(testCase.transaction)
    expect(ast[0].type).toBe('start transaction')
    expect(ast[1].type).toBe('update')
    expect(ast[2].type).toBe('update')
    expect(ast[3].type).toBe('rollback')
  })

  it('join', () => {
    const ast = sqlToAst(testCase.join)
    expect(ast[0].type).toBe('select')
    expect((ast[0] as any).from).toBeDefined()
    expect((ast[0] as any).from[0].type).toBe('table')
    expect((ast[0] as any).from[1].join).toBeDefined()
  })

  it('count', () => {
    const ast = sqlToAst(testCase.count)
    expect(ast[0].type).toBe('select')
    expect((ast[0] as any).columns[0].expr.function).toBeDefined()
    expect((ast[0] as any).columns[0].expr.function.name).toBe('count')
    expect((ast[0] as any).columns[0].expr.args[0].name).toBe('*')
  })

  it('multipleConditions', () => {
    const ast = sqlToAst(testCase.multipleConditions)
    expect(ast[0].type).toBe('select')
    expect((ast[0] as any).where.type).toBe('binary')
    expect((ast[0] as any).where.op).toBe('OR')
    expect((ast[0] as any).where.left.op).toBe('AND')
    expect((ast[0] as any).where.right.op).toBe('<')
  })

  it('empty query', () => {
    const ast = sqlToAst('')
    expect(ast).toEqual([])
  })

  it('invalid syntax', () => {
    expect(() => sqlToAst('INVALID SYNTAX')).toThrow(SyntaxError)
  })
})

describe('should modify AST and maintain a map of original and hashed column names', () => {
  let ast: Statement[]
  beforeEach((ctx) => {
    const taskName = ctx.task.name as keyof typeof testCase
    ast = sqlToAst(testCase[taskName])
  })

  it('select', () => {
    // const ast = sqlToAst(testCase.select)
    const map: Record<string, string> = {}
    const modifiedAst = modifyAst(ast, map)

    const hashedA = hash('a')
    const hashedB = hash('b')

    expect((modifiedAst[0] as any).columns[0].expr.name).toBe(hashedA)
    expect((modifiedAst[0] as any).columns[1].expr.name).toBe(hashedB)
    expect(map).toEqual({ a: hashedA, b: hashedB })
  })
  it('insert', () => {
    // const ast = sqlToAst(testCase.insert)
    const map: Record<string, string> = {}
    const modifiedAst = modifyAst(ast, map)

    // check hash
    const hashedColumnNames = [
      'username',
      'password',
      'email',
      'created_at',
    ].map((name) => hash(name))
    expect((modifiedAst[0] as any).columns.map((x: any) => x.name)).toEqual(
      hashedColumnNames
    )
    // check map
    hashedColumnNames.forEach((hashedName, index) => {
      const originalName = ['username', 'password', 'email', 'created_at'][
        index
      ]
      expect(map[originalName]).toBe(hashedName)
    })
  })

  it('update', () => {
    // const ast = sqlToAst(testCase.update)
    const map: Record<string, string> = {}
    const modifiedAst = modifyAst(ast, map)

    const hashedColumnName = hash('username')
    expect((modifiedAst[0] as any).sets[0].column.name).toBe(hashedColumnName)
    expect(map['username']).toBe(hashedColumnName)
  })

  it('delete', () => {
    // const ast = sqlToAst(testCase.delete)
    const map: Record<string, string> = {}
    const modifiedAst = modifyAst(ast, map)
    const hashedColumnName = hash('id')
    expect((modifiedAst[0] as any).where.left.name).toBe(hashedColumnName)
    expect(map['id']).toBe(hashedColumnName)
  })

  it('transaction', () => {
    // const ast = sqlToAst(testCase.transaction)
    const map: Record<string, string> = {}
    const modifiedAst = modifyAst(ast, map)
    // console.log(modifiedAst)
    const hashedEmail = createHash('sha256').update('email').digest('hex')
    const hashedUsername = createHash('sha256').update('username').digest('hex')
    const hashedLastLogin = createHash('sha256')
      .update('last_login')
      .digest('hex')
    expect((modifiedAst[1] as any).sets[0].column.name).toBe(hashedEmail)
    expect((modifiedAst[2] as any).sets[0].column.name).toBe(hashedLastLogin)
    expect(map).toEqual({
      email: hashedEmail,
      last_login: hashedLastLogin,
      username: hashedUsername,
    })
  })
})

describe('should rebuild SQL from AST', () => {
  let ast: Statement[]
  let map: Record<string, string> = {}
  let modifiedAst: Statement[]
  beforeEach((ctx) => {
    map = {}
    const taskName = ctx.task.name as keyof typeof testCase
    ast = sqlToAst(testCase[taskName])
    modifiedAst = modifyAst(ast, map)
  })
  it('select', () => {
    const modifiedSql = rebuildSql(modifiedAst)
    const hashedA = hash('a')
    const hashedB = hash('b')
    const modifiedSqlParse = sqlToAst(modifiedSql)
    const originSqlParse = sqlToAst(`
    SELECT "${hashedA}", "${hashedB}"
    FROM test
    WHERE "${hashedA}" = 5;
    `)
    expect(modifiedSqlParse).toStrictEqual(originSqlParse)
  })

  it('insert', () => {
    const modifiedSql = rebuildSql(modifiedAst)
    const modifiedSqlParse = sqlToAst(modifiedSql)
    const testSqlHashed = testCase.insert
      .replace('username', hash('username'))
      .replace('password', hash('password'))
      .replace('email', hash('email'))
      .replace('created_at', hash('created_at'))
    const originSqlParse = sqlToAst(testSqlHashed)
    expect(modifiedSqlParse).toStrictEqual(originSqlParse)
  })

  it('update', () => {
    const modifiedSql = rebuildSql(modifiedAst)

    const modifiedSqlParse = sqlToAst(modifiedSql)
    const originSqlParse = sqlToAst(
      testCase.update
        .replace('username', hash('username'))
        .replace('id', hash('id'))
    )
    expect(modifiedSqlParse).toStrictEqual(originSqlParse)
  })

  it('delete', () => {
    const modifiedSql = rebuildSql(modifiedAst)
    const modifiedSqlParse = sqlToAst(modifiedSql)
    const originSqlParse = sqlToAst(testCase.delete.replace('id', hash('id')))
    expect(modifiedSqlParse).toStrictEqual(originSqlParse)
  })

  it('transaction', () => {
    const modifiedSql = rebuildSql(modifiedAst)
    const modifiedSqlParse = sqlToAst(modifiedSql)
    const originSqlParse = sqlToAst(
      testCase.transaction
        .replaceAll('email', hash('email'))
        .replaceAll('last_login', hash('last_login'))
        .replaceAll('username', hash('username'))
    )
    expect(modifiedSqlParse).toStrictEqual(originSqlParse)
  })

  it('join', () => {
    const modifiedSql = rebuildSql(modifiedAst)
    const modifiedSqlParse = sqlToAst(modifiedSql)
    const originSqlHashed = testCase.join
      .replaceAll(`"orders"."order_id"`, `"orders"."${hash('order_id')}"`)
      .replaceAll(`"users"."username"`, `"users"."${hash('username')}"`)
      .replaceAll(`"users"."user_id"`, `"users"."${hash('user_id')}"`)
      .replaceAll(`"orders"."user_id"`, `"orders"."${hash('user_id')}"`)
      .replaceAll('user_id', hash('user_id'))
    const originSqlHashedParse = sqlToAst(originSqlHashed)
    expect(modifiedSqlParse).toStrictEqual(originSqlHashedParse)
  })
})
