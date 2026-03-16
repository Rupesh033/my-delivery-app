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
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true
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
    const { name, phone, vehicle, gender } = req.body;
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
        gender: gender || 'male',
        role: 'rider'
    };

    mockDb.riders.push(newRider);
    const { saveDb } = require('./services/rideService'); // Import here for side effect
    saveDb(mockDb);
    io.to('admins').emit('systemUpdate', mockDb); // Notify admins of new application
    res.status(201).json({ success: true, riderId: newRider.id });
});

app.post('/api/riders/login', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const rider = mockDb.riders.find(r => r.phone === phone);
    if (!rider) {
        return res.status(404).json({ error: 'Rider not found with this phone number.' });
    }

    res.json({ 
        success: true, 
        riderId: rider.id,
        isApproved: rider.isApproved,
        name: rider.name,
        gender: rider.gender || 'male',
        rating: rider.rating || 4.5
    });
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
        const { userId, pickup, drop, fare, vehicleType, serviceType, isPinkMode, pickupCoords, dropCoords } = req.body;
        if (!pickup || !drop) {
            return res.status(400).json({ error: 'pickup and drop are required' });
        }

        const ride = RideService.createRide(userId || 'guest', pickup, drop, fare || 0, vehicleType || 'Bike', pickupCoords, dropCoords, serviceType || 'ride');
        ride.isPinkMode = !!isPinkMode;

        // Broadcast to riders and admins (Optimized)
        if (ride.isPinkMode) {
            io.to('riders_female').emit('newRideRequest', ride);
        } else {
            io.to('riders').emit('newRideRequest', ride);
        }
        io.to('admins').emit('systemUpdate', mockDb); // Notify admins of new ride

        res.status(201).json({ ride });
    } catch (err) {
        console.error('[BOOK] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[SOCKET] Connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

    // Join room based on role if provided in handshake
    const { role, userId, gender } = socket.handshake.query;
    if (role === 'admin') socket.join('admins');
    if (role === 'rider') {
        socket.join('riders');
        if (gender === 'female') socket.join('riders_female');
    }
    if (userId) socket.join(`user_${userId}`);

    // ── Admin Registration ──
    socket.on('registerAdmin', () => {
        try {
            socket.join('admins');
            console.log(`[ADMIN] Admin connected: ${socket.id}`);
            socket.emit('systemUpdate', mockDb);
        } catch (err) {
            console.error('[ADMIN_REG] Error:', err);
        }
    });

    // ── Rider goes online ──
    socket.on('goOnline', ({ riderId }) => {
        try {
            if (!riderId) return;
            socket.data.riderId = riderId;
            socket.data.role = 'rider';
            socket.join('riders');
            socket.join(`rider_${riderId}`);
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

            io.to('admins').emit('systemUpdate', mockDb); 
        } catch (err) {
            console.error('[ONLINE] Error:', err);
        }
    });

    // ── Rider goes offline ──
    socket.on('goOffline', ({ riderId }) => {
        try {
            socket.leave('riders');
            socket.leave(`rider_${riderId}`);
            console.log(`[OFFLINE] Rider ${riderId} is OFFLINE`);
            io.to('admins').emit('systemUpdate', mockDb);
        } catch (err) {
            console.error('[OFFLINE] Error:', err);
        }
    });

    // ── Rider updates location ──
    socket.on('updateLocation', ({ riderId, lat, lng }) => {
        try {
            if (!riderId) return;
            // Update mockDb for admin view
            const rider = mockDb.riders.find(r => r.id === riderId);
            if (rider) {
                rider.lat = lat;
                rider.lng = lng;
            }
            // Broadcast only to admins and relevant customers (optimized)
            io.to('admins').emit('riderLocationUpdate', { riderId, lat, lng });
        } catch (err) {
            console.error('[LOCATION] Error:', err);
        }
    });

    // ── Rider accepts ride ──
    socket.on('acceptRide', ({ rideId, riderId }) => {
        try {
            if (!rideId || !riderId) return;
            const ride = RideService.updateRideStatus(rideId, 'accepted', riderId);
            if (!ride) return socket.emit('error', { message: 'Ride not found' });

            // Notify specific customer, the rider, and admins
            io.to(`user_${ride.customerId}`).emit('rideAccepted', { rideId, riderId, ride });
            io.to(`rider_${riderId}`).emit('rideAccepted', { rideId, riderId, ride });
            io.to('admins').emit('systemUpdate', mockDb);
            
            // Remove from other riders' searching list
            socket.broadcast.to('riders').emit('rideRemoved', { rideId });
        } catch (err) {
            console.error('[ACCEPT] Error:', err);
        }
    });

    // ── Rider verifies OTP to start ride ──
    socket.on('verifyOTP', ({ rideId, otp }) => {
        try {
            const result = RideService.verifyOTP(rideId, otp);
            if (result.success) {
                const ride = result.ride;
                io.to(`user_${ride.customerId}`).emit('rideStarted', { rideId, status: 'on_ride' });
                io.to(`rider_${ride.riderId}`).emit('rideStarted', { rideId, status: 'on_ride' });
                io.to('admins').emit('systemUpdate', mockDb);
            } else {
                socket.emit('otpError', { message: 'Invalid OTP' });
            }
        } catch (err) {
            console.error('[OTP] Error:', err);
        }
    });

    socket.on('emergencySOS', (data) => {
        console.warn(`[EMERGENCY] SOS received from Ride ${data.rideId} | User: ${data.userId}`);
        io.to('admins').emit('adminSOSAlert', data);
    });

    socket.on('angelAlert', (data) => {
        console.warn(`[ANGEL] Stationary Alert received for Ride ${data.rideId}`);
        io.to('admins').emit('angelAlert', data);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[SOCKET] Disconnected: ${socket.id} | Reason: ${reason}`);
    });
});

// ─── Global Error Handlers ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rapido Backend running on port ${PORT}`);
});
