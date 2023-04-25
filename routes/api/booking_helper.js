const { bookingModel } = require('../../models/bookingModel')
const findEarliestAvailableTimeSlot = async (worker, day) => {
    const foundBookings = await bookingModel.find({ worker: worker, isPaid: true, completed: false, cancelled: false, day }).sort('start');
    console.log("Found bookings", foundBookings)
    const twoHours = 2 * 60 * 60 * 1000;
    const maxBookingsPerDay = 3;

    if (foundBookings.length >= maxBookingsPerDay) {
        return null;
    }

    let currentTimeSlot = new Date(day);
    currentTimeSlot.setHours(8, 0, 0, 0); // Set time to 8am on the given day

    for (const booking of foundBookings) {
        const bookingEnd = new Date(booking.end);

        if (currentTimeSlot.getTime() + twoHours <= booking.start) {
            return currentTimeSlot;
        }

        currentTimeSlot = new Date(bookingEnd.getTime() + twoHours);
    }

    if (currentTimeSlot.getHours() <= 15) {
        return currentTimeSlot;
    }

    return null;
};

// Helper function to validate required fields and return the name of the missing field
const getMissingField = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            return key;
        }
    }
    return null;
};

module.exports.findEarliestAvailableTimeSlot = findEarliestAvailableTimeSlot;
module.exports.getMissingField = getMissingField;