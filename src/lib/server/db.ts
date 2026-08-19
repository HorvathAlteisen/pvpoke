/**
 * MySQL connection pool for the training-battle telemetry endpoints
 * (data/training/postTraining.php, data/training/getTraining.php). Created lazily on
 * first use so pages that never touch the database do not need one configured.
 * Connection details come from .env (see .env.example): DB_HOST, DB_NAME, DB_USER, DB_PASS.
 */
import mysql, { type Pool } from 'mysql2/promise';
import { env } from '$env/dynamic/private';

let pool: Pool | undefined;

export function getPool(): Pool {
	if (!pool) {
		pool = mysql.createPool({
			host: env.DB_HOST || 'localhost',
			database: env.DB_NAME || 'pvpoke_training',
			user: env.DB_USER || 'root',
			password: env.DB_PASS || '',
			waitForConnections: true,
			connectionLimit: 5
		});
	}
	return pool;
}
