import { Destination } from "../models/destination.js";

/** Save a new destination document to MongoDB. */
export function createDestination(destinationData) {
  return Destination.create(destinationData);
}

/** Return all destinations, newest first. */
export function listDestinations() {
  return Destination.find().sort({ createdAt: -1 });
}

/** Find one destination by its MongoDB document ID. */
export function findDestinationById(id) {
  return Destination.findById(id);
}

/** Update a destination and return the updated document. */
export function updateDestination(id, updates) {
  return Destination.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

/** Delete a destination and return the deleted document. */
export function deleteDestination(id) {
  return Destination.findByIdAndDelete(id);
}
