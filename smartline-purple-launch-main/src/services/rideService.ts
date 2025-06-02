import pool from '@/config/database';

export interface Ride {
  id: number;
  passenger_id: number;
  driver_id?: number;
  pickup_address: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  destination_address: string;
  destination_latitude?: number;
  destination_longitude?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  vehicle_type: string;
  estimated_fare?: number;
  created_at: string;
}

export const rideService = {
  async createRide(ride: Omit<Ride, 'id' | 'created_at'>): Promise<Ride> {
    const [result] = await pool.execute(
      `INSERT INTO rides (
        passenger_id, pickup_address, pickup_latitude, pickup_longitude,
        destination_address, destination_latitude, destination_longitude,
        vehicle_type, estimated_fare
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ride.passenger_id,
        ride.pickup_address,
        ride.pickup_latitude,
        ride.pickup_longitude,
        ride.destination_address,
        ride.destination_latitude,
        ride.destination_longitude,
        ride.vehicle_type,
        ride.estimated_fare
      ]
    );

    const [rides] = await pool.execute(
      'SELECT * FROM rides WHERE id = ?',
      [(result as any).insertId]
    );

    return (rides as Ride[])[0];
  },

  async getRidesByUserId(userId: number, role: 'passenger' | 'driver'): Promise<Ride[]> {
    const column = role === 'passenger' ? 'passenger_id' : 'driver_id';
    const [rides] = await pool.execute(
      `SELECT * FROM rides WHERE ${column} = ? ORDER BY created_at DESC`,
      [userId]
    );

    return rides as Ride[];
  },

  async updateRideStatus(rideId: number, status: Ride['status']): Promise<Ride> {
    await pool.execute(
      'UPDATE rides SET status = ? WHERE id = ?',
      [status, rideId]
    );

    const [rides] = await pool.execute(
      'SELECT * FROM rides WHERE id = ?',
      [rideId]
    );

    return (rides as Ride[])[0];
  }
}; 