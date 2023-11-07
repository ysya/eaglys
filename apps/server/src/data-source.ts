import 'reflect-metadata'
import { DataSource } from 'typeorm'

import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { SqlHashMap } from './entities/SqlHashMap.entity'

export const Sqlite = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: true,
  entities: [SqlHashMap],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
})
