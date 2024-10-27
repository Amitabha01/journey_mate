import Ride from "../models/ride.model.js";
import User from "../models/user.model.js";

//create a ride

const createRide = async (req, res, next) => {
    const { departureLocation, destination, departureDate, availableSeats, price } = req.body;
    const driver = req.User._id;

    try {

        const ride = new Ride({ driver, departureLocation, destination, departureDate, availableSeats, price });
        await ride.save();
        res.status(201).json(ride);

    } catch (error) {

        res.status(400).json({ message: error.message });

    }
};

//search for rides

const searchRides = async () => {
    const { departureLocation, destination, departureDate } = req.query;

    try {
        
        const rides = await Ride.find({ departureLocation, destination, departureDate })
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
};


export {
    createRide,
    searchRides
}