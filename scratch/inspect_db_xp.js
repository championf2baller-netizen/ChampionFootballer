require('dotenv').config({ path: './championfootballerserver/.env' });
const { Client } = require('pg');

async function inspectUsers() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  console.log('Connected to DB');

  // Total users count
  const totalUsersRes = await c.query('SELECT COUNT(*)::int AS count FROM users');
  console.log('Total users in DB:', totalUsersRes.rows[0].count);

  // Users with xp > 0
  const usersWithXpRes = await c.query('SELECT COUNT(*)::int AS count FROM users WHERE xp > 0');
  console.log('Users with xp > 0:', usersWithXpRes.rows[0].count);

  // Users with xp IS NULL or xp = 0
  const usersZeroXpRes = await c.query('SELECT COUNT(*)::int AS count FROM users WHERE xp IS NULL OR xp = 0');
  console.log('Users with 0 or NULL xp:', usersZeroXpRes.rows[0].count);

  // Users with achievements
  const usersWithAchRes = await c.query("SELECT COUNT(*)::int AS count FROM users WHERE achievements IS NOT NULL AND cardinality(achievements) > 0");
  console.log('Users with achievements count > 0:', usersWithAchRes.rows[0].count);

  // Users with empty or null achievements
  const usersEmptyAchRes = await c.query("SELECT COUNT(*)::int AS count FROM users WHERE achievements IS NULL OR cardinality(achievements) = 0");
  console.log('Users with empty or NULL achievements:', usersEmptyAchRes.rows[0].count);

  // Check sample users with highest XP
  const topXpRes = await c.query(`
    SELECT id, "firstName", "lastName", email, xp, achievements
    FROM users
    ORDER BY xp DESC NULLS LAST
    LIMIT 15
  `);
  console.log('\nTop 15 users by XP in DB:');
  console.table(topXpRes.rows);

  // Compare users.xp with SUM(match_statistics.xp_awarded)
  const statsComparison = await c.query(`
    WITH stats_xp AS (
      SELECT 
        ms.user_id, 
        SUM(COALESCE(ms.xp_awarded, 0))::int AS total_stat_xp,
        COUNT(ms.id)::int as stat_count
      FROM match_statistics ms
      JOIN "Matches" m ON ms.match_id = m.id
      WHERE m.status IN ('RESULT_PUBLISHED', 'RESULT_UPLOADED')
      GROUP BY ms.user_id
    )
    SELECT 
      u.id, 
      u."firstName", 
      u."lastName", 
      u.xp AS user_table_xp,
      COALESCE(s.total_stat_xp, 0) AS match_stats_xp,
      COALESCE(s.stat_count, 0) AS match_stats_count,
      u.achievements,
      (u.xp - COALESCE(s.total_stat_xp, 0)) AS diff
    FROM users u
    LEFT JOIN stats_xp s ON u.id = s.user_id
    WHERE u.xp > 0 OR s.total_stat_xp > 0
    ORDER BY u.xp DESC NULLS LAST
    LIMIT 20
  `);
  console.log('\nTop 20 users XP comparison (users.xp vs match_statistics.xp_awarded):');
  console.table(statsComparison.rows);

  // Count mismatches between user.xp and stats_xp (without achievements)
  const mismatchCount = await c.query(`
    WITH stats_xp AS (
      SELECT 
        ms.user_id, 
        SUM(COALESCE(ms.xp_awarded, 0))::int AS total_stat_xp
      FROM match_statistics ms
      JOIN "Matches" m ON ms.match_id = m.id
      WHERE m.status IN ('RESULT_PUBLISHED', 'RESULT_UPLOADED')
      GROUP BY ms.user_id
    )
    SELECT COUNT(*)::int AS count
    FROM users u
    LEFT JOIN stats_xp s ON u.id = s.user_id
    WHERE COALESCE(u.xp, 0) != COALESCE(s.total_stat_xp, 0)
  `);
  console.log('\nUsers where u.xp != total_stat_xp:', mismatchCount.rows[0].count);

  // Total match_statistics rows
  const totalStatsRes = await c.query('SELECT COUNT(*)::int AS count, SUM(xp_awarded)::int as total_xp FROM match_statistics');
  console.log('\nTotal match_statistics:', totalStatsRes.rows[0]);

  // Total matches
  const totalMatchesRes = await c.query('SELECT status, COUNT(*)::int AS count FROM "Matches" GROUP BY status');
  console.log('\nMatches by status:');
  console.table(totalMatchesRes.rows);

  await c.end();
}

inspectUsers().catch(console.error);
