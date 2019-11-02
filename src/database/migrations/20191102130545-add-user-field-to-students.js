module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('students', 'user_id', {
      type: Sequelize.INTEGER,
      references: { model: 'users', key: 'id' },
      allowNull: false,
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('students', 'user_id')
  },
}
