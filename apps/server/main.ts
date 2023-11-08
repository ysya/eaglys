import 'reflect-metadata'
import 'sqlite3'
import express, { Request, Response, NextFunction } from 'express'
import { sqlParse } from '../../packages/sql-parser'
import { modifyAst, rebuildSql, sqlToAst } from '../../packages/sql-parser'
import http from 'http'
import { SqlHashMap } from './src/entities/SqlHashMap.entity'
import { Sqlite } from './src/data-source'
import { DataSource, Repository } from 'typeorm'
import cors from 'cors'

export const DI = {} as {
  server: http.Server
  orm: DataSource
  sqlHashMapRepo: Repository<SqlHashMap>
}

export const app = express()
app.use(cors())

const port = process.env.PORT || 3000
export const init = (async () => {
  DI.orm = await Sqlite.initialize()
  DI.sqlHashMapRepo = DI.orm.getRepository(SqlHashMap)
  app.use(express.json())
  app.post('/api/sql/build-ast', (req, res) => {
    const { ast } = req.body
    try {
      const sql = rebuildSql(ast)
      // success
      res.status(200).json({
        code: 200,
        msg: 'ok',
        data: sql,
      })
    } catch (error) {
      return res.status(400).json({
        code: 400,
        msg: 'incorrect data format',
        data: null,
      })
    }
  })

  // hash ast
  app.post('/api/sql/hash-ast', async (req, res) => {
    const { ast } = req.body
    try {
      rebuildSql(ast)
    } catch (error) {
      return res.status(400).json({
        code: 400,
        msg: 'incorrect data format',
        data: null,
      })
    }
    try {
      // TODO: Directly check exist hash from database or cache, for poc just read to memory first
      // read from db
      const result = await DI.sqlHashMapRepo.find()
      const mapFromDb: Record<string, string> = result.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.originColumnName] = item.hashedColumnName
          return acc
        },
        {}
      )
      const parsed = modifyAst(ast, mapFromDb)
      // write to db
      const mapToArray = Object.entries(parsed.hashMap).map(
        ([originColumnName, hashedColumnName]) => ({
          originColumnName,
          hashedColumnName,
        })
      )
      await DI.orm
        .createQueryBuilder()
        .insert()
        .into(SqlHashMap)
        .values(mapToArray)
        .orIgnore('originColumnName')
        .updateEntity(false)
        .execute()

      // success
      res.status(200).json({
        code: 200,
        msg: 'ok',
        data: { ast: parsed.ast, hashMap: parsed.hashMap },
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        code: 500,
        msg: 'parse error',
        data: null,
      })
    }
  })

  // parse to ast
  app.post('/api/sql/parse', (req, res) => {
    const { sqlString } = req.body
    if (typeof sqlString !== 'string') {
      return res.status(400).json({
        code: 400,
        msg: 'incorrect data format',
        data: null,
      })
    }
    try {
      const parsed = sqlToAst(sqlString)
      // success
      res.status(200).json({
        code: 200,
        msg: 'ok',
        data: parsed,
      })
    } catch (error) {
      return res.status(500).json({
        code: 500,
        msg: 'parse error',
        data: null,
      })
    }
  })

  // complete parse flow
  app.post('/api/sql/hash', async (req, res) => {
    const { sqlString } = req.body
    if (typeof sqlString !== 'string') {
      return res.status(400).json({
        code: 400,
        msg: 'incorrect data format',
        data: null,
      })
    }
    try {
      // read from db
      const result = await DI.sqlHashMapRepo.find()
      const mapFromDb: Record<string, string> = result.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.originColumnName] = item.hashedColumnName
          return acc
        },
        {}
      )
      const parsed = sqlParse(sqlString, mapFromDb)

      // write to db
      const mapToArray = Object.entries(parsed.hashMap).map(
        ([originColumnName, hashedColumnName]) => ({
          originColumnName,
          hashedColumnName,
        })
      )
      await DI.orm
        .createQueryBuilder()
        .insert()
        .into(SqlHashMap)
        .values(mapToArray)
        .orIgnore('originColumnName')
        .updateEntity(false)
        .execute()

      // success
      res.status(200).json({
        code: 200,
        msg: 'ok',
        data: parsed,
      })
    } catch (error) {
      return res.status(500).json({
        code: 500,
        msg: 'parse error',
        data: null,
      })
    }
  })
  // Error handling middleware for JSON parse errors
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.status === 400 && 'body' in err) {
      return res.status(400).json({
        code: 400,
        msg: 'Bad JSON',
        data: null,
      })
    }
    return res.status(500).json({
      code: 500,
      msg: 'Internal Server Error',
      data: null,
    })
  })
  app.use((req, res) => res.status(404).json({ message: 'No route found' }))

  // serve
  DI.server = app.listen(port, () => {
    console.log(`express serve on：${port}`)
  })
})()
