import { execute, query } from './db';

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  body?: string;
}

/**
 * Creates a new notification for a user
 */
export async function createNotification(data: NotificationData): Promise<void> {
  const { userId, type, title, body } = data;
  
  // Store title and body in the payload field as JSON
  const payload = JSON.stringify({ title, body });
  
  await execute(
    'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)',
    [userId, type, payload, 0]
  );
}

/**
 * Creates notifications for multiple users
 */
export async function createNotifications(usersIds: string[], data: Omit<NotificationData, 'userId'>): Promise<void> {
  if (usersIds.length === 0) return;
  
  const { type, title, body } = data;
  const payload = JSON.stringify({ title, body });
  const placeholders = usersIds.map(() => '(?, ?, ?, ?)').join(', ');
  const values: any[] = [];
  
  for (const userId of usersIds) {
    values.push(userId, type, payload, 0);
  }
  
  await execute(
    `INSERT INTO notifications (user_id, type, payload, is_read) VALUES ${placeholders}`,
    values
  );
}

/**
 * Gets user's unread notification count
 */
export async function getUserUnreadNotificationCount(userId: string): Promise<number> {
  const rows: any[] = await query(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  
  return rows.length > 0 ? Number(rows[0].cnt) : 0;
}
