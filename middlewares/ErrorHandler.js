export const ErrorHandler = (req, res, err) => {
  if (err.code == 400) {
    res.status(err.code).json({ message: "Bad Request", success: false });
    return;
  } else if (err.code == 401) {
    res.status(err.code).json({ message: "Unauthorized", success: false });
    return;
  } else if (err.code == 403) {
    res
      .status(err.code)
      .json({ message: "Don't have access to This Service", success: false });
    return;
  } else if (err.code == 404) {
    res.status(err.code).json({ message: "Not Found", success: false });
    return;
  } else if (err.code == 500) {
    res
      .status(err.code)
      .json({ message: "Internal Server Error", success: false });
    return;
  } else if (err.code == 502) {
    res.status(err.code).json({ message: "Bad Gateway", success: false });
    return;
  } else if (err.code == 503) {
    res
      .status(err.code)
      .json({ message: "Service Unavailable", success: false });
    return;
  } else if (err.code === 11000 || err.name === "MongoServerError") {
    res.status(500).json({
      message: "Currently we're down",
      reason: `Duplicy of an unique Key ${err.message}`,
      success: false,
    });
    return;
  } else if (err.name === "TokenExpiredError") {
    res.status(401).json({
      message: "Token is Expired Pls Login Again",
      success: false,
    });
    return;
  } else {
    res.status(500).json({
      message: "Currently we're down",
      reason: err.message,
      success: false,
    });
    return;
  }
};
