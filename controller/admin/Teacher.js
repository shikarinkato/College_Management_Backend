import { ErrorHandler } from "../../middlewares/ErrorHandler";

export const CreateTeacher = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
