module.exports = (Grid, connection, driver) ->
  Grid.mongo = driver
  new Grid(connection.db, driver.mongo)

