const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:12345@localhost:5432/championfootballer', {
  logging: false,
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // Find season 2c52fb14-922a-4470-bc8a-f24cc56b9d0c
    const [seasons] = await sequelize.query(`SELECT id, name, "isActive", archived, "leagueId" FROM "Seasons" WHERE id = '2c52fb14-922a-4470-bc8a-f24cc56b9d0c'`);
    console.log('Before update:', seasons);

    await sequelize.query(`UPDATE "Seasons" SET "isActive" = true, archived = false WHERE id = '2c52fb14-922a-4470-bc8a-f24cc56b9d0c'`);
    await sequelize.query(`UPDATE "Leagues" SET active = true, archived = false WHERE id = '1e91fbf0-3bf3-49a9-b14e-ae38bf921817'`);

    const [updatedSeasons] = await sequelize.query(`SELECT id, name, "isActive", archived, "leagueId" FROM "Seasons" WHERE id = '2c52fb14-922a-4470-bc8a-f24cc56b9d0c'`);
    console.log('After update:', updatedSeasons);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

main();
