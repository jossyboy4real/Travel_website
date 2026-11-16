import { Hotel } from "../models/hotel.js";

/** Create a hotel and include its destination in the response. */
export function createHotel(hotelData) {
  return Hotel.create(hotelData).then((hotel) => hotel.populate("destination"));
}

/** Return hotels, newest first, with their destination details. */
export function listHotels() {
  return Hotel.find().populate("destination").sort({ createdAt: -1 });
}

/** Find one hotel by its MongoDB document ID. */
export function findHotelById(id) {
  return Hotel.findById(id).populate("destination");
}

/** Update a hotel and return it with its destination details. */
export function updateHotel(id, updates) {
  return Hotel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("destination");
}

/** Delete a hotel and return the deleted document. */
export function deleteHotel(id) {
  return Hotel.findByIdAndDelete(id).populate("destination");
}