export const ErrorHandler = (req, res, err) => {
  if (err.code == 400) {
    res.status(err.code).json({ message: "Bad Request", success: false });
  } else if (err.code == 401) {
    res.status(err.code).json({ message: "Unauthorized", success: false });
  } else if (err.code == 403) {
    res
      .status(err.code)
      .json({ message: "Don't have access to This Service", success: false });
  } else if (err.code == 404) {
    res.status(err.code).json({ message: "Not Found", success: false });
  } else if (err.code == 500) {
    res
      .status(err.code)
      .json({ message: "Internal Server Error", success: false });
  } else if (err.code == 502) {
    res.status(err.code).json({ message: "Bad Gateway", success: false });
  } else if (err.code == 503) {
    res
      .status(err.code)
      .json({ message: "Service Unavailable", success: false });
  } else
    res.status(500).json({ message: "Currently we're down", success: false });
};
