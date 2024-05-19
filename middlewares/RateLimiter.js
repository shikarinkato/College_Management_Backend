import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests from this IP, please try again after 15 minutes",
  headers: true, // Send rate limit info in the header
});

export default limiter;
