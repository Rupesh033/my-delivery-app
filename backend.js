/**
 * Rapido-like Platform Shared Backend (Mock)
 * Handles synchronization between Customer, Rider, and Admin apps.
 */

const Backend = {
    // Shared state keys
    KEYS: {
        RIDE_REQUESTS: 'rapido_ride_requests',
        RIDERS: 'rapido_riders',
        USERS: 'rapido_users',
        ACTIVE_RIDES: 'rapido_active_rides',
        SYSTEM_STATS: 'rapido_system_stats'
    },

    init() {
        if (!localStorage.getItem(this.KEYS.RIDE_REQUESTS)) {
            localStorage.setItem(this.KEYS.RIDE_REQUESTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.RIDERS)) {
            this.seedRiders();
        }
        console.log('Backend initialized');
    },

    seedRiders() {
        const riders = [
            { id: 'R1', name: 'Rupesh Rider', vehicle: 'Activa 6G', status: 'online', rating: 4.8, location: { lat: 12.9716, lng: 77.5946 } },
            { id: 'R2', name: 'Amit Kumar', vehicle: 'Pulsar 150', status: 'online', rating: 4.5, location: { lat: 12.9720, lng: 77.5950 } }
        ];
        localStorage.setItem(this.KEYS.RIDERS, JSON.stringify(riders));
    },

    // Ride Methods
    requestRide(userId, pickup, drop, fare) {
        const requests = JSON.parse(localStorage.getItem(this.KEYS.RIDE_REQUESTS));
        const newRequest = {
            id: 'REQ_' + Date.now(),
            userId,
            pickup,
            drop,
            fare,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        requests.push(newRequest);
        localStorage.setItem(this.KEYS.RIDE_REQUESTS, JSON.stringify(requests));
        this.notify('NEW_RIDE_REQUEST', newRequest);
        return newRequest;
    },

    acceptRide(rideId, riderId) {
        const requests = JSON.parse(localStorage.getItem(this.KEYS.RIDE_REQUESTS));
        const index = requests.findIndex(r => r.id === rideId);
        if (index !== -1 && requests[index].status === 'pending') {
            requests[index].status = 'accepted';
            requests[index].riderId = riderId;
            localStorage.setItem(this.KEYS.RIDE_REQUESTS, JSON.stringify(requests));
            this.notify('RIDE_ACCEPTED', requests[index]);
            return requests[index];
        }
        return null;
    },

    // Pub-Sub simulation using BroadcastChannel
    channel: new BroadcastChannel('rapido_events'),

    notify(event, data) {
        this.channel.postMessage({ event, data });
    },

    on(event, callback) {
        this.channel.addEventListener('message', (e) => {
            if (e.data.event === event) {
                callback(e.data.data);
            }
        });
    }
};

Backend.init();
window.Backend = Backend;
