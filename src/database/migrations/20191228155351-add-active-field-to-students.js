module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('students', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('students', 'active')
  },
}
