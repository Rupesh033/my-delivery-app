/**
 * Mock Database Service for initial development.
 * This will be replaced with real Supabase/PostgreSQL calls.
 */

/**
 * Simple JSON Persistence Service for development.
 * This keeps data alive during process restarts.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function loadDb() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading DB:', err);
    }
    return {
        settings: { perKm: 12, baseFare: 30 },
        riders: [
            { id: 'R1', name: 'Rupesh', role: 'rider', isOnline: true, isApproved: true, lat: 24.1627, lng: 83.8055, vehicle: 'Bike' }
        ],
        rides: [],
        users: []
    };
}

function saveDb(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving DB:', err);
    }
}

const mockDb = loadDb();

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
        saveDb(mockDb);
        return ride;
    },

    verifyOTP: (rideId, otp) => {
        const ride = mockDb.rides.find(r => r.id === rideId);
        if (ride && ride.otp === otp) {
            ride.status = 'on_ride';
            saveDb(mockDb);
            return { success: true, ride };
        }
        return { success: false };
    },

    updateRideStatus: (rideId, status, riderId = null) => {
        const ride = mockDb.rides.find(r => r.id === rideId);
        if (ride) {
            ride.status = status;
            if (riderId) ride.riderId = riderId;
            saveDb(mockDb);
            return ride;
        }
        return null;
    },

    // Admin Methods
    approveRider: (riderId) => {
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) {
            rider.isApproved = true;
            saveDb(mockDb);
        }
        return rider;
    },

    rejectRider: (riderId) => {
        const riderIndex = mockDb.riders.findIndex(r => r.id === riderId);
        if (riderIndex > -1) {
            mockDb.riders.splice(riderIndex, 1);
            saveDb(mockDb);
        }
        return true;
    },

    updatePricing: (perKm, baseFare) => {
        mockDb.settings.perKm = Number(perKm);
        mockDb.settings.baseFare = Number(baseFare);
        saveDb(mockDb);
        return mockDb.settings;
    }
};

module.exports = { mockDb, RideService, saveDb };
