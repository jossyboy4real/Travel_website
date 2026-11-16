import {
  createDestination as createDestinationService,
  deleteDestination as deleteDestinationService,
  findDestinationById as findDestinationByIdService,
  listDestinations as listDestinationsService,
  updateDestination as updateDestinationService,
} from "../services/destination.js";

export const createDestination = async (req, res, next) => {
  try {
    const destination = await createDestinationService(req.body);
    return res.status(201).json(destination);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const getDestinations = async (_req, res, next) => {
  try {
    const destinations = await listDestinationsService();
    return res.json(destinations);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const getDestinationById = async (req, res, next) => {
  try {
    const destination = await findDestinationByIdService(req.params.id);
    if (!destination) {
      return res.status(404).json({
        status: false,
        message: "Destination not found",
      });
    }

    return res.status(200).json({
      status: true,
      destination,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const destination = await updateDestinationService(req.params.id, req.body);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    return res.status(200).json({ status: true, destination });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const destination = await deleteDestinationService(req.params.id);

    if (!destination) {
      return res.status(404).json({ status: false, message: "Destination not found" });
    }
    return res.status(200).json({ status: true, message: "Destinatio Deleted successfully", destination });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
