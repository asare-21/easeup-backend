const { bookingModel } = require('../../models/bookingModel')

const findEarliestAvailableTimeSlot = async (worker, day) => {
    const promisefoundBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        day,
        cancelled: false,
        completed: false,
        $or: [
            { pending: true },
        ]
    }).sort({ date: 1 });
    const promisecheckBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        cancelled: false,
        completed: false,
        $or: [
            { pending: true },
        ]
    }).sort({ date: 1 });

    const [foundBookings, checkBookings] = await Promise.all([promisefoundBookings, promisecheckBookings]) // get all bookings for the day
    console.log("Found bookings: ", foundBookings);
    const bookingInterval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const maxBookingsPerDay = foundBookings.find((e) => e.pending == true) || checkBookings.find((e) => e.pending == true) == undefined ? 4 : 1; // limit booking to 1 if there is a pending booking on that day
    //limit booking to one if the account has a pending booking

    const startOfDay = new Date(day)





    startOfDay.setHours(8, 0, 0, 0); // Set time to 8am on the given day
    let currentTimeSlot = startOfDay;

    if (foundBookings.length >= maxBookingsPerDay) {
        return null;
    }

    for (const booking of foundBookings) {
        const bookingEnd = new Date(booking.date);

        if (currentTimeSlot.getTime() + bookingInterval <= bookingEnd.getTime()) {
            // The current time slot is before the booking, so return it
            return currentTimeSlot;
        }

        currentTimeSlot = new Date(bookingEnd.getTime() + bookingInterval);
    }

    // Return the last time slot of the day if there are less than 4 bookings
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