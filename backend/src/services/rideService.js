/**
 * Mock Database Service for initial development.
 * This will be replaced with real Supabase/PostgreSQL calls.
 */

const mockDb = {
    settings: {
        perKm: 12,
        baseFare: 30
    },
    riders: [
        { id: 'R1', name: 'Rupesh', role: 'rider', isOnline: true, isApproved: true, lat: 24.1627, lng: 83.8055, vehicle: 'Bike' },
        { id: 'R2', name: 'Amit', role: 'rider', isOnline: false, isApproved: false, lat: 24.1750, lng: 83.8200, vehicle: 'Scooter' }
    ],
    rides: [],
    users: [
        { id: 'U1', name: 'Customer User', phone: '9876543210' }
    ]
};

const RideService = {
    findNearestRider: (pickup) => {
        // Only return approved and online riders
        return mockDb.riders.find(r => r.isOnline && r.isApproved);
    },

    createRide: (customerId, pickup, drop, fare, pickupCoords = [24.1627, 83.8055], dropCoords = [24.1750, 83.8200]) => {
        const ride = {
            id: 'RIDE_' + Date.now(),
            customerId,
            pickup,
            drop,
            fare,
            pickupCoords,
            dropCoords,
            otp: Math.floor(1000 + Math.random() * 9000).toString(),
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
    },

    // Admin Methods
    approveRider: (riderId) => {
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) rider.isApproved = true;
        return rider;
    },

    rejectRider: (riderId) => {
        const riderIndex = mockDb.riders.findIndex(r => r.id === riderId);
        if (riderIndex > -1) mockDb.riders.splice(riderIndex, 1);
        return true;
    },

    updatePricing: (perKm, baseFare) => {
        mockDb.settings.perKm = Number(perKm);
        mockDb.settings.baseFare = Number(baseFare);
        return mockDb.settings;
    }
};

module.exports = { mockDb, RideService };
