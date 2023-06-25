const { bookingModel } = require('../../models/bookingModel');

const findEarliestAvailableTimeSlot = async (worker, day) => {
    const promisefoundBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        day,
        cancelled: false,
        completed: false,
    }).sort({ date: 1 });

    const promisecheckBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        cancelled: false,
        completed: false,
        pending: true,
    }).sort({ date: 1 });

    const [foundBookings, checkBookings] = await Promise.all([
        promisefoundBookings,
        promisecheckBookings,
    ]);

    console.log("Found bookings: ", foundBookings);

    const maxBookingsPerDay = checkBookings.length > 0 ? 1 : 3;

    if (foundBookings.length >= maxBookingsPerDay) {
        return null;
    }

    const startOfDay = new Date(day);
    startOfDay.setHours(8, 0, 0, 0); // Set time to 8am on the given day

    let currentTimeSlot = startOfDay;

    for (const booking of foundBookings) {
        const bookingEnd = new Date(booking.date);
        const bookingInterval = bookingEnd.getTime() - currentTimeSlot.getTime();

        if (bookingInterval >= 3 * 60 * 60 * 1000) {
            // The current time slot is before the booking, so return it
            return currentTimeSlot;
        }

        currentTimeSlot = new Date(bookingEnd.getTime());
    }

    const endOfDay = new Date(day);
    endOfDay.setHours(15, 0, 0, 0); // Set time to 3pm on the given day

    if (currentTimeSlot.getTime() < endOfDay.getTime()) {
        return currentTimeSlot;
    }

    // Calculate the next available time slot on the next day
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    nextDay.setHours(8, 0, 0, 0); // Set time to 8am on the next day

    return findEarliestAvailableTimeSlot(worker, nextDay);
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
