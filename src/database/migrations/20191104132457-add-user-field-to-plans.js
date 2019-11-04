module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('plans', 'user_id', {
      type: Sequelize.INTEGER,
      references: { model: 'users', key: 'id' },
      allowNull: false,
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('plans', 'user_id')
  },
}
