import { searchFlights as searchFlightsService } from "../services/flight.js";

const CABIN_CLASSES = new Set(["economy", "premium_economy", "business", "first"]);

function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function searchFlights(req, res, next) {
  const { origin, destination, departure_date, adults, cabin_class } = req.body ?? {};

  if (!origin || !/^[A-Za-z]{3}$/.test(origin)) {
    return res.status(400).json({
      status: false,
      message: "origin must be a three-letter airport code, such as LOS.",
    });
  }

  if (!destination || !/^[A-Za-z]{3}$/.test(destination)) {
    return res.status(400).json({
      status: false,
      message: "destination must be a three-letter airport code, such as LHR.",
    });
  }

  if (origin.toUpperCase() === destination.toUpperCase()) {
    return res.status(400).json({
      status: false,
      message: "origin and destination must be different airports.",
    });
  }

  if (typeof departure_date !== "string" || !isValidCalendarDate(departure_date)) {
    return res.status(400).json({
      status: false,
      message: "departure_date must be a valid date in YYYY-MM-DD format.",
    });
  }

  if (!Number.isInteger(adults) || adults < 1) {
    return res.status(400).json({
      status: false,
      message: "adults must be a whole number greater than or equal to 1.",
    });
  }

  if (typeof cabin_class !== "string" || !CABIN_CLASSES.has(cabin_class)) {
    return res.status(400).json({
      status: false,
      message: "cabin_class must be economy, premium_economy, business, or first.",
    });
  }

  try {
    const flights = await searchFlightsService({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure_date,
      adults,
      cabin_class,
    });

    return res.status(200).json({ status: true, flights });
  } catch (error) {
    return next(error);
  }
}