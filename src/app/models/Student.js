import Sequelize, { Model } from 'sequelize'

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        birthday: Sequelize.DATE,
        height: Sequelize.DECIMAL(3, 2),
        weight: Sequelize.DECIMAL(5, 2),
        user_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' })
  }
}

export default Student
