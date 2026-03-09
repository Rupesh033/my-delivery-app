require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { RideService, mockDb } = require('./services/rideService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    console.log('Health check received');
    res.send('Rapido-Like Platform API is running');
});

// Ride Booking Endpoint
app.post('/api/rides/book', (req, res) => {
    const { userId, pickup, drop, fare } = req.body;
    console.log(`Booking request received from ${userId}: ${pickup} to ${drop}`);

    const ride = RideService.createRide(userId, pickup, drop, fare);

    // Find nearest rider (mocked logic)
    const rider = RideService.findNearestRider(pickup);
    if (rider) {
        console.log(`Rider ${rider.id} found online. Broadcasting ride request.`);
    } else {
        console.log('No riders currently online. Request will be queued for when they connect.');
    }

    // Always broadcast so if a rider is connecting right now, they might catch it
    io.emit('newRideRequest', ride);

    res.status(201).json({ ride, rider });
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('updateLocation', (data) => {
        // data: { riderId, lat, lng }
        const { riderId, lat, lng } = data;
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) {
            rider.lat = lat;
            rider.lng = lng;
            rider.isOnline = true; // Mark as online when they send location
            socket.join('riders'); // Ensure they are in the riders room
        }
        socket.broadcast.emit('riderLocationUpdate', data);
    });

    socket.on('goOnline', (data) => {
        const { riderId } = data;
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) rider.isOnline = true;
        socket.join('riders');
        console.log(`Rider ${riderId} is now ONLINE`);

        // Push any currently pending requests to the newly online rider
        const pendingRides = mockDb.rides.filter(r => r.status === 'searching');
        pendingRides.forEach(ride => {
            console.log(`Sending pending ride ${ride.id} to newly online rider ${riderId}`);
            socket.emit('newRideRequest', ride);
        });
    });

    socket.on('goOffline', (data) => {
        const { riderId } = data;
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) rider.isOnline = false;
        socket.leave('riders');
        console.log(`Rider ${riderId} is now OFFLINE`);
    });

    socket.on('acceptRide', (data) => {
        const { rideId, riderId } = data;
        console.log(`Ride ${rideId} accepted by rider ${riderId}`);

        // Update ride status in service
        const ride = RideService.updateRideStatus(rideId, 'accepted', riderId);

        console.log(`Broadcasting rideAccepted for ride ${rideId} to all clients. OTP: ${ride?.otp}`);
        // Notify all clients that the ride is accepted 
        // In a real app, we would notify only the specific customer
        io.emit('rideAccepted', { rideId, riderId, ride });
    });

    socket.on('verifyOTP', (data) => {
        const { rideId, otp } = data;
        const result = RideService.verifyOTP(rideId, otp);

        if (result.success) {
            io.emit('rideStarted', { rideId, status: 'on_ride' });
        } else {
            socket.emit('otpError', { message: 'Invalid OTP' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
