const { bookingModel } = require('../../models/bookingModel')
const findEarliestAvailableTimeSlot = async (worker, day) => {
    const foundBookings = await bookingModel.find({ worker: worker, isPaid: true, completed: false, cancelled: false, day }).sort('start');
    const twoHours = 2 * 60 * 60 * 1000;

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

module.exports.isValidBookingTime = isValidBookingTime;