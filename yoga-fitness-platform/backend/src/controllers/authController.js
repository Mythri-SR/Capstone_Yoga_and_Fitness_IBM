import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password, fullName, role = 'user', phone } = req.body;
    const existing = await queryOne(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const r = role === 'trainer' ? 'trainer' : 'user';
    const ins = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?,?,?,?,?)`,
      [email, hash, r, fullName, phone || null]
    );
    const userId = ins.insertId;
    if (r === 'trainer') {
      await query(
        `INSERT INTO trainer_profiles (user_id, bio, experience_years, hourly_rate) VALUES (?,?,?,?)`,
        [userId, '', 0, 50]
      );
    }
    await query(`INSERT IGNORE INTO progress_tracking (user_id) VALUES (?)`, [userId]);
    const user = await queryOne(
      `SELECT id, email, role, full_name AS fullName, phone FROM users WHERE id = ?`,
      [userId]
    );
    const token = signToken({ id: user.id, role: user.role, email: user.email, full_name: user.fullName });
    res.status(201).json({ ok: true, token, user });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await queryOne(
      `SELECT id, email, password_hash, role, full_name AS fullName, phone FROM users WHERE email = ?`,
      [email]
    );
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    const { password_hash, ...safe } = user;
    const token = signToken({ id: safe.id, role: safe.role, email: safe.email, full_name: safe.fullName });
    res.json({ ok: true, token, user: safe });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await queryOne(
      `SELECT id, email, role, full_name AS fullName, phone FROM users WHERE id = ?`,
      [req.user.sub]
    );
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}
