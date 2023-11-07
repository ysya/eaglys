import { Column, Entity } from 'typeorm'
import { BaseModel } from './base'

@Entity()
export class SqlHashMap extends BaseModel {
  @Column({ unique: true, comment: 'The original column name' })
  originColumnName: string

  @Column({ comment: 'The hashed column name' })
  hashedColumnName: string
}
