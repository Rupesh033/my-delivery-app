require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { RideService } = require('./services/rideService');

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

    // Find nearest rider
    const rider = RideService.findNearestRider(pickup);
    if (rider) {
        console.log('Broadcasting ride request to all riders...');
        io.emit('newRideRequest', ride);
    } else {
        console.log('No online riders found for broadcast.');
    }

    res.status(201).json({ ride, rider });
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('updateLocation', (data) => {
        // data: { riderId, lat, lng }
        socket.broadcast.emit('riderLocationUpdate', data);
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
