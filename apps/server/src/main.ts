import express, { Request, Response, NextFunction } from 'express'
import { sqlParse } from '@package/sql-parser'
const app = express()

app.use(express.json())

// '/api/sql/parse'
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
    const parseSql = sqlParse(sqlString)
    // success
    res.status(200).json({
      code: 200,
      msg: 'ok',
      data: parseSql,
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
// serve
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`express serve on：${PORT}`)
})
