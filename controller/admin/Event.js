import EventSchema from "../../models/event/Event.js";

export const GetAllEvents = async (req, res) => {
  try {
    let events = await EventSchema.find({});

    if (events.length > 0) {
      res.status(200).json({
        message: "All Events Fetched Succesfully",
        success: true,
        events,
      });
      return;
    } else {
      res.status(404).json({
        message: "0 Events Found",
        success: false,
      });
      return;
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};
