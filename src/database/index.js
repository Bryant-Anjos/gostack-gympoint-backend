import Sequelize from 'sequelize'

import Checkin from '../app/models/Checkin'
import Enrollment from '../app/models/Enrollment'
import File from '../app/models/File'
import HelpOrder from '../app/models/HelpOrder'
import Plan from '../app/models/Plan'
import Student from '../app/models/Student'
import User from '../app/models/User'

import databaseConfig from '../config/database'

const models = [User, Student, Plan, Enrollment, Checkin, HelpOrder, File]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(databaseConfig)

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

export default new Database()
