/**
 * Mock Database Service for initial development.
 * This will be replaced with real Supabase/PostgreSQL calls.
 */

const mockDb = {
    riders: [
        { id: 'R1', name: 'Rupesh', role: 'rider', isOnline: true, lat: 24.1627, lng: 83.8055, vehicle: 'Bike' },
        { id: 'R2', name: 'Amit', role: 'rider', isOnline: false, lat: 24.1750, lng: 83.8200, vehicle: 'Scooter' }
    ],
    rides: [],
    users: [
        { id: 'U1', name: 'Customer User', phone: '9876543210' }
    ]
};

const RideService = {
    findNearestRider: (pickup) => {
        // Simple distance check (mocked)
        return mockDb.riders.find(r => r.isOnline);
    },

    createRide: (customerId, pickup, drop, fare) => {
        const ride = {
            id: 'RIDE_' + Date.now(),
            customerId,
            pickup,
            drop,
            fare,
            otp: Math.floor(1000 + Math.random() * 9000).toString(), // Generate 4-digit OTP
            status: 'searching',
            timestamp: new Date()
        };
        mockDb.rides.push(ride);
        return ride;
    },

    verifyOTP: (rideId, otp) => {
        const ride = mockDb.rides.find(r => r.id === rideId);
        if (ride && ride.otp === otp) {
            ride.status = 'on_ride';
            return { success: true, ride };
        }
        return { success: false };
    },

    updateRideStatus: (rideId, status, riderId = null) => {
        const ride = mockDb.rides.find(r => r.id === rideId);
        if (ride) {
            ride.status = status;
            if (riderId) ride.riderId = riderId;
            return ride;
        }
        return null;
    }
};

module.exports = { mockDb, RideService };
