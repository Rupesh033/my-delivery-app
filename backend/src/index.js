require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { RideService, mockDb } = require('./services/rideService'); // FIX: import mockDb

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Rapido Backend is running', time: new Date() });
});

// ─── Ride Booking REST Endpoint ───────────────────────────────────────────────
app.post('/api/rides/book', (req, res) => {
    try {
        const { userId, pickup, drop, fare } = req.body;
        if (!pickup || !drop) {
            return res.status(400).json({ error: 'pickup and drop are required' });
        }
        console.log(`[BOOK] ${userId}: "${pickup}" → "${drop}" @ ₹${fare}`);

        const ride = RideService.createRide(userId || 'guest', pickup, drop, fare || 0);
        console.log(`[BOOK] Ride created: ${ride.id} | OTP: ${ride.otp}`);

        // Broadcast to every connected socket (riders will filter on their end)
        io.emit('newRideRequest', ride);
        console.log(`[BOOK] Broadcasted newRideRequest to ${io.engine.clientsCount} clients`);

        res.status(201).json({ ride });
    } catch (err) {
        console.error('[BOOK] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[SOCKET] Connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

    // ── Rider goes online ──
    socket.on('goOnline', ({ riderId }) => {
        try {
            socket.data.riderId = riderId;
            socket.data.role = 'rider';
            socket.join('riders');
            console.log(`[ONLINE] Rider ${riderId} is ONLINE (socket: ${socket.id})`);

            // Send any waiting (searching) rides to this newly-online rider
            const pending = mockDb.rides.filter(r => r.status === 'searching');
            if (pending.length > 0) {
                console.log(`[ONLINE] Sending ${pending.length} pending ride(s) to ${riderId}`);
                pending.forEach(ride => socket.emit('newRideRequest', ride));
            }
        } catch (err) {
            console.error('[ONLINE] Error:', err);
        }
    });

    // ── Rider goes offline ──
    socket.on('goOffline', ({ riderId }) => {
        socket.leave('riders');
        console.log(`[OFFLINE] Rider ${riderId} is OFFLINE`);
    });

    // ── Rider updates location ──
    socket.on('updateLocation', ({ riderId, lat, lng }) => {
        socket.broadcast.emit('riderLocationUpdate', { riderId, lat, lng });
    });

    // ── Rider accepts ride ──
    socket.on('acceptRide', ({ rideId, riderId }) => {
        try {
            console.log(`[ACCEPT] Rider ${riderId} accepted ride ${rideId}`);
            const ride = RideService.updateRideStatus(rideId, 'accepted', riderId);
            if (!ride) {
                console.error(`[ACCEPT] Ride ${rideId} not found`);
                return socket.emit('error', { message: 'Ride not found' });
            }
            console.log(`[ACCEPT] Broadcasting rideAccepted | OTP: ${ride.otp}`);
            io.emit('rideAccepted', { rideId, riderId, ride });
        } catch (err) {
            console.error('[ACCEPT] Error:', err);
        }
    });

    // ── Rider verifies OTP to start ride ──
    socket.on('verifyOTP', ({ rideId, otp }) => {
        try {
            const result = RideService.verifyOTP(rideId, otp);
            if (result.success) {
                console.log(`[OTP] Ride ${rideId} started`);
                io.emit('rideStarted', { rideId, status: 'on_ride' });
            } else {
                socket.emit('otpError', { message: 'Invalid OTP. Please try again.' });
            }
        } catch (err) {
            console.error('[OTP] Error:', err);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`[SOCKET] Disconnected: ${socket.id} | Reason: ${reason}`);
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rapido Backend running on port ${PORT}`);
});
