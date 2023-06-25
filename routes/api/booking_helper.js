const { bookingModel } = require('../../models/bookingModel');

const findEarliestAvailableTimeSlot = async (worker, day) => {
    const promisefoundBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        day,
        cancelled: false,
        completed: false,
        $or: [{ pending: true }],
    }).sort({ date: 1 });

    const promisecheckBookings = await bookingModel.find({
        worker: worker,
        isPaid: true,
        cancelled: false,
        completed: false,
        $or: [{ pending: true }],
    }).sort({ date: 1 });

    const [foundBookings, checkBookings] = await Promise.all([
        promisefoundBookings,
        promisecheckBookings,
    ]);

    console.log("Found bookings: ", foundBookings);

    const bookingInterval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const hasPendingBooking = foundBookings.some((booking) => booking.pending === true);
    const hasBookingsForDay = foundBookings.length > 0 || checkBookings.length > 0;

    const maxBookingsPerDay = hasPendingBooking ? 1 : 4;

    const startOfDay = new Date(day);
    startOfDay.setHours(8, 0, 0, 0); // Set time to 8am on the given day

    let currentTimeSlot = startOfDay;

    if (hasBookingsForDay && foundBookings.length >= maxBookingsPerDay) {
        // If there are existing bookings and the maximum limit is reached, find the next available slot
        const lastBooking = foundBookings[foundBookings.length - 1];
        currentTimeSlot = new Date(lastBooking.date.getTime() + bookingInterval);
    }

    while (currentTimeSlot.getHours() < 15) {
        const isSlotAvailable = foundBookings.every((booking) => {
            const bookingEnd = new Date(booking.date.getTime() + bookingInterval);
            return currentTimeSlot.getTime() + bookingInterval > bookingEnd.getTime();
        });

        if (isSlotAvailable) {
            return currentTimeSlot;
        }

        currentTimeSlot = new Date(currentTimeSlot.getTime() + bookingInterval);
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
