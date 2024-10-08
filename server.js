const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require ("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/database")


// load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//route Files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const app = express();

// Body parser
app.use(express.json());

// Cookie parser  
app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//file uploading
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent xss attacks
app.use(xss());

//rate limiting
const limiter = rateLimit({
  windowMs: 12 * 60 * 1000, //12 mins
  max: 100
});

//apply to all requests
app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enable cors
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

//error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});


// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`.red); 
  server.close(() => process.exit(1));
});