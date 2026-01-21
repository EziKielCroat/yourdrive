export async function trackFileActivity(
  fileId: number,
  userId: string,
  activityType: string,
  metadata: object = {},
  pool: any,
) {
  await pool.query(
    `INSERT INTO file_activity (file_id, user_id, activity_type, metadata)
     VALUES ($1, $2, $3, $4)`,
    [fileId, userId, activityType, JSON.stringify(metadata)],
  );
}
