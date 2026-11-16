import {
  createTour as createTourService,
  deleteTour as deleteTourService,
  findTourById as findTourByIdService,
  listTours as listToursService,
  updateTour as updateTourService,
} from "../services/tour.js";

export async function createTour(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      status: false,
      message: "Send one tour as a JSON object, not an array.",
    });
  }

  try {
    const tour = await createTourService(req.body);
    return res.status(201).json({ status: true, tour });
  } catch (error) {
    return next(error);
  }
}

export async function getTours(_req, res, next) {
  try {
    const tours = await listToursService();
    return res.status(200).json({ status: true, tours });
  } catch (error) {
    return next(error);
  }
}

export async function getTourById(req, res, next) {
  try {
    const tour = await findTourByIdService(req.params.id);
    if (!tour) {
      return res.status(404).json({ status: false, message: "Tour not found" });
    }

    return res.status(200).json({ status: true, tour });
  } catch (error) {
    return next(error);
  }
}

export async function updateTour(req, res, next) {
  try {
    const tour = await updateTourService(req.params.id, req.body);
    if (!tour) {
      return res.status(404).json({ status: false, message: "Tour not found" });
    }

    return res.status(200).json({ status: true, tour });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTour(req, res, next) {
  try {
    const tour = await deleteTourService(req.params.id);
    if (!tour) {
      return res.status(404).json({ status: false, message: "Tour not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Tour Deleted successfully",
      tour,
    });
  } catch (error) {
    return next(error);
  }
}