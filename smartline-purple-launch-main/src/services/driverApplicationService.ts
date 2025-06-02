import pool from '@/config/database';

export interface DriverApplication {
  id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  vehicle_type?: string;
  license_number?: string;
  created_at: string;
}

export const driverApplicationService = {
  async createApplication(userId: number, data: { vehicle_type: string; license_number: string }): Promise<DriverApplication> {
    const [result] = await pool.execute(
      'INSERT INTO driver_applications (user_id, vehicle_type, license_number) VALUES (?, ?, ?)',
      [userId, data.vehicle_type, data.license_number]
    );

    const [applications] = await pool.execute(
      'SELECT * FROM driver_applications WHERE id = ?',
      [(result as any).insertId]
    );

    return (applications as DriverApplication[])[0];
  },

  async getApplications(status?: DriverApplication['status']): Promise<DriverApplication[]> {
    let query = 'SELECT * FROM driver_applications';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [applications] = await pool.execute(query, params);
    return applications as DriverApplication[];
  },

  async updateApplicationStatus(applicationId: number, status: DriverApplication['status']): Promise<DriverApplication> {
    await pool.execute(
      'UPDATE driver_applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    if (status === 'approved') {
      // Update user role to driver
      const [application] = await pool.execute(
        'SELECT user_id FROM driver_applications WHERE id = ?',
        [applicationId]
      );
      const userId = (application as any[])[0].user_id;

      await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['driver', userId]
      );
    }

    const [applications] = await pool.execute(
      'SELECT * FROM driver_applications WHERE id = ?',
      [applicationId]
    );

    return (applications as DriverApplication[])[0];
  }
}; 