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
    res.json({
        status: 'ok',
        message: 'Rapido Backend is running',
        time: new Date(),
        clients: io.engine.clientsCount
    });
});

// ─── Admin Endpoints ──────────────────────────────────────────────────────────
app.get('/api/admin/data', (req, res) => {
    res.json(mockDb);
});

app.post('/api/riders/register', (req, res) => {
    const { name, phone, vehicle } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Missing information' });

    const newRider = {
        id: 'R' + Date.now(),
        name,
        phone,
        vehicle: vehicle || 'Bike',
        isOnline: false,
        isApproved: false,
        lat: 24.1627,
        lng: 83.8055,
        role: 'rider'
    };

    mockDb.riders.push(newRider);
    io.to('admins').emit('systemUpdate', mockDb); // Notify admins of new application
    res.status(201).json({ success: true, riderId: newRider.id });
});

app.post('/api/admin/riders/action', (req, res) => {
    const { riderId, action } = req.body;
    let rider = null;
    if (action === 'approve') rider = RideService.approveRider(riderId);
    if (action === 'reject' || action === 'remove') RideService.rejectRider(riderId);

    // Notify the specific rider if they are connected
    if (action === 'approve') {
        io.emit('riderStatusUpdate', { riderId, status: 'approved' });
    } else if (action === 'remove' || action === 'reject') {
        io.emit('riderStatusUpdate', { riderId, status: 'removed' });
    }

    // Broadcast update to admins
    io.to('admins').emit('systemUpdate', mockDb);
    res.json({ success: true });
});

app.post('/api/admin/settings', (req, res) => {
    const { perKm, baseFare } = req.body;
    RideService.updatePricing(perKm, baseFare);

    // Broadcast update to admins
    io.to('admins').emit('systemUpdate', mockDb);
    res.json({ success: true, settings: mockDb.settings });
});

// ─── Ride Booking REST Endpoint ───────────────────────────────────────────────
app.post('/api/rides/book', (req, res) => {
    try {
        const { userId, pickup, drop, fare, pickupCoords, dropCoords } = req.body;
        if (!pickup || !drop) {
            return res.status(400).json({ error: 'pickup and drop are required' });
        }

        const ride = RideService.createRide(userId || 'guest', pickup, drop, fare || 0, pickupCoords, dropCoords);

        // Broadcast to riders and admins
        io.emit('newRideRequest', ride);
        io.to('admins').emit('systemUpdate', mockDb); // Notify admins of new ride

        res.status(201).json({ ride });
    } catch (err) {
        console.error('[BOOK] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[SOCKET] Connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

    // ── Admin Registration ──
    socket.on('registerAdmin', () => {
        socket.join('admins');
        console.log(`[ADMIN] Admin connected: ${socket.id}`);
        socket.emit('systemUpdate', mockDb);
    });

    // ── Rider goes online ──
    socket.on('goOnline', ({ riderId }) => {
        try {
            socket.data.riderId = riderId;
            socket.data.role = 'rider';
            socket.join('riders');
            console.log(`[ONLINE] Rider ${riderId} is ONLINE`);

            // Check if rider is approved
            const rider = mockDb.riders.find(r => r.id === riderId);
            if (!rider || !rider.isApproved) {
                return socket.emit('error', { message: 'Your account is pending admin approval.' });
            }

            // Send any waiting (searching) rides to this newly-online rider
            const pending = mockDb.rides.filter(r => r.status === 'searching');
            if (pending.length > 0) {
                pending.forEach(ride => socket.emit('newRideRequest', ride));
            }

            io.to('admins').emit('systemUpdate', mockDb); // Notify admins
        } catch (err) {
            console.error('[ONLINE] Error:', err);
        }
    });

    // ── Rider goes offline ──
    socket.on('goOffline', ({ riderId }) => {
        socket.leave('riders');
        console.log(`[OFFLINE] Rider ${riderId} is OFFLINE`);
        io.to('admins').emit('systemUpdate', mockDb);
    });

    // ── Rider updates location ──
    socket.on('updateLocation', ({ riderId, lat, lng }) => {
        // Update mockDb for admin view
        const rider = mockDb.riders.find(r => r.id === riderId);
        if (rider) {
            rider.lat = lat;
            rider.lng = lng;
        }
        socket.broadcast.emit('riderLocationUpdate', { riderId, lat, lng });
        io.to('admins').emit('systemUpdate', mockDb); // Real-time map update for admin
    });

    // ── Rider accepts ride ──
    socket.on('acceptRide', ({ rideId, riderId }) => {
        try {
            const ride = RideService.updateRideStatus(rideId, 'accepted', riderId);
            if (!ride) return socket.emit('error', { message: 'Ride not found' });

            io.emit('rideAccepted', { rideId, riderId, ride });
            io.to('admins').emit('systemUpdate', mockDb);
        } catch (err) {
            console.error('[ACCEPT] Error:', err);
        }
    });

    // ── Rider verifies OTP to start ride ──
    socket.on('verifyOTP', ({ rideId, otp }) => {
        try {
            const result = RideService.verifyOTP(rideId, otp);
            if (result.success) {
                io.emit('rideStarted', { rideId, status: 'on_ride' });
                io.to('admins').emit('systemUpdate', mockDb);
            } else {
                socket.emit('otpError', { message: 'Invalid OTP' });
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
