import { Tour } from "../models/tour.js";

/** Create a tour and include its destination in the response. */
export function createTour(tourData) {
  return Tour.create(tourData).then((tour) => tour.populate("destination"));
}

/** Return tours, newest first, with their destination details. */
export function listTours() {
  return Tour.find().populate("destination").sort({ createdAt: -1 });
}

/** Find one tour by its MongoDB document ID. */
export function findTourById(id) {
  return Tour.findById(id).populate("destination");
}

/** Update a tour and return it with its destination details. */
export function updateTour(id, updates) {
  return Tour.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("destination");
}

/** Delete a tour and return the deleted document. */
export function deleteTour(id) {
  return Tour.findByIdAndDelete(id).populate("destination");
}