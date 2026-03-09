/**
 * Mock Database Service for initial development.
 * This will be replaced with real Supabase/PostgreSQL calls.
 */

const mockDb = {
    riders: [
        { id: '1', name: 'Rupesh', role: 'rider', isOnline: true, lat: 12.9716, lng: 77.5946, vehicle: 'Bike' },
        { id: '2', name: 'Amit', role: 'rider', isOnline: false, lat: 12.9720, lng: 77.5950, vehicle: 'Scooter' }
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
