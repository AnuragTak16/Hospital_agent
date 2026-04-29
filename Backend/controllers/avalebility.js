import Availability from '../models/availability.js';
import Doctor from '../models/docter.js';

export const createAvailability = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: 'doctorId, date, startTime, endTime are required',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Prevent duplicate slot
    const existing = await Availability.findOne({
      doctorId,
      date,
      startTime,
      endTime,
    });

    if (existing) {
      return res.status(400).json({ message: 'Slot already exists' });
    }

    const slot = await Availability.create({
      doctorId,
      date,
      startTime,
      endTime,
    });

    return res.status(201).json({
      message: 'Availability created',
      slot,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const filter = {
      isBooked: false,
    };

    if (doctorId) filter.doctorId = doctorId;
    if (date) filter.date = date;

    const slots = await Availability.find(filter).populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name phone',
      },
    });

    return res.status(200).json({
      slots,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBulkAvailability = async (req, res) => {
  try {
    const { doctorId, startDate, days, startTime, endTime, slotDuration } =
      req.body;

    if (
      !doctorId ||
      !startDate ||
      !days ||
      !startTime ||
      !endTime ||
      !slotDuration
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const slots = [];

    const start = new Date(startDate);

    for (let d = 0; d < days; d++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + d);

      // Convert time to minutes
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + slotDuration <= endMinutes) {
        const slotStartH = Math.floor(currentMinutes / 60);
        const slotStartM = currentMinutes % 60;

        const nextMinutes = currentMinutes + slotDuration;

        const slotEndH = Math.floor(nextMinutes / 60);
        const slotEndM = nextMinutes % 60;

        const format = (h, m) =>
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        slots.push({
          doctorId,
          date: new Date(currentDate),
          startTime: format(slotStartH, slotStartM),
          endTime: format(slotEndH, slotEndM),
          isBooked: false,
        });

        currentMinutes = nextMinutes;
      }
    }

    await Availability.insertMany(slots);

    return res.status(201).json({
      message: 'Bulk availability created',
      totalSlots: slots.length,
    });
  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};
