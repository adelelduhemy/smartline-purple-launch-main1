import pool from '@/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'driver' | 'admin';
  is_verified: boolean;
  rating: number;
  total_rides: number;
}

export const userService = {
  async signUp(email: string, password: string, fullName: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, fullName]
    );

    const [users] = await pool.execute(
      'SELECT id, email, full_name, role, is_verified, rating, total_rides FROM users WHERE id = ?',
      [(result as any).insertId]
    );

    return (users as User[])[0];
  },

  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = (users as any[])[0];
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async getUserById(id: number): Promise<User> {
    const [users] = await pool.execute(
      'SELECT id, email, full_name, phone, role, is_verified, rating, total_rides FROM users WHERE id = ?',
      [id]
    );

    const user = (users as User[])[0];
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const allowedFields = ['full_name', 'phone'];
    const updates = Object.entries(data)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key]) => `${key} = ?`)
      .join(', ');

    if (!updates) {
      throw new Error('No valid fields to update');
    }

    await pool.execute(
      `UPDATE users SET ${updates} WHERE id = ?`,
      [...Object.values(data), id]
    );

    return this.getUserById(id);
  }
}; 