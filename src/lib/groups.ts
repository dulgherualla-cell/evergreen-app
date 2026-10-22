import { all, one } from "./db";

export const GROUP_STATS = `
  g.*,
  (SELECT COUNT(*) FROM members m WHERE m.group_code = g.code) AS member_count,
  (SELECT COUNT(*) FROM answers a JOIN members m2 ON m2.group_code = a.group_code AND m2.user_id = a.user_id
    WHERE a.group_code = g.code) AS answer_count`;

export async function ownedGroups(db: any, userId: string) {
  return all<any>(db, `SELECT ${GROUP_STATS} FROM groups g WHERE g.owner_id = ? ORDER BY g.created_at DESC`, userId);
}

export async function memberGroups(db: any, userId: string) {
  return all<any>(
    db,
    `SELECT ${GROUP_STATS} FROM groups g JOIN members me ON me.group_code = g.code AND me.user_id = ?
      ORDER BY g.created_at DESC`,
    userId
  );
}

export async function getGroup(db: any, code: string) {
  if (!/^[A-Z0-9]{6}$/.test(code)) return null;
  return one<any>(db, "SELECT * FROM groups WHERE code = ?", code);
}

export async function groupMembers(db: any, code: string) {
  return all<any>(
    db,
    `SELECT m.user_id, m.name, m.avatar_icon, m.avatar_color, m.joined_at,
            a.updated_at AS answered_at
       FROM members m LEFT JOIN answers a ON a.group_code = m.group_code AND a.user_id = m.user_id
      WHERE m.group_code = ?
      ORDER BY m.joined_at ASC`,
    code
  );
}

export function parseAnswer(row: any) {
  if (!row) return null;
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}
