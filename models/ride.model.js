import mongoose, { Schema } from "mongoose";


const rideSchema = new Schema({
    driver: {
        trpe: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    origin: {
        address: String,
        
    },

    destination: {
        type: String,
        required: true
    },

    departureDate: {
        type: Date,
        required: true
    },

    availableSeats: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    }
}, { 

    timestamps: true 

});

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;