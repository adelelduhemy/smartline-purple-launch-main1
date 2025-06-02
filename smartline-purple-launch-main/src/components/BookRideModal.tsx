import { useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookRideModalProps {
  onRideBooked?: () => void;
  children?: ReactNode;
}

export function BookRideModal({ onRideBooked, children }: BookRideModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('standard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to book a ride');
      return;
    }

    try {
      // Store ride in localStorage
      const rides = JSON.parse(localStorage.getItem('rides') || '[]');
      const newRide = {
        id: Date.now().toString(),
        passenger_id: user.id,
        pickup_address: pickup,
        destination_address: destination,
        vehicle_type: vehicleType,
        status: 'pending',
        created_at: new Date().toISOString(),
        estimated_fare: Math.floor(Math.random() * 50) + 10, // Random fare between 10 and 60
      };
      
      rides.push(newRide);
      localStorage.setItem('rides', JSON.stringify(rides));

      setOpen(false);
      onRideBooked?.();
      
      // Reset form
      setPickup('');
      setDestination('');
      setVehicleType('standard');
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Book a Ride</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a Ride</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pickup">Pickup Location</Label>
              <Input
                id="pickup"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup address"
                required
              />
          </div>
          <div>
            <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination address"
                required
              />
          </div>
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Book Ride
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
