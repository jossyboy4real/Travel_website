import {
  createHotel as createHotelService,
  deleteHotel as deleteHotelService,
  findHotelById as findHotelByIdService,
  listHotels as listHotelsService,
  updateHotel as updateHotelService,
} from "../services/hotel.js";

export async function createHotel(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      status: false,
      message: "Send one hotel as a JSON object, not an array.",
    });
  }

  try {
    const hotel = await createHotelService(req.body);
    return res.status(201).json({ status: true, hotel });
  } catch (error) {
    return next(error);
  }
}

export async function getHotels(_req, res, next) {
  try {
    const hotels = await listHotelsService();
    return res.status(200).json({ status: true, hotels });
  } catch (error) {
    return next(error);
  }
}

export async function getHotelById(req, res, next) {
  try {
    const hotel = await findHotelByIdService(req.params.id);
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    return res.status(200).json({ status: true, hotel });
  } catch (error) {
    return next(error);
  }
}

export async function updateHotel(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      status: false,
      message: "Send the hotel updates as a JSON object, not an array.",
    });
  }

  try {
    const hotel = await updateHotelService(req.params.id, req.body);
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    return res.status(200).json({ status: true, hotel });
  } catch (error) {
    return next(error);
  }
}

export async function deleteHotel(req, res, next) {
  try {
    const hotel = await deleteHotelService(req.params.id);
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Hotel deleted successfully",
      hotel,
    });
  } catch (error) {
    return next(error);
  }
}