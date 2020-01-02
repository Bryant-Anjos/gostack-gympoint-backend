module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('checkins', 'counter', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('checkins', 'counter')
  },
}
