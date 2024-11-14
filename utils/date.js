import moment from "moment-timezone";
//returns the local time date to our local area
const getCurrentDate = () =>{
  // Set the timezone to Asia/Manila and get the local time
  const timezone = "Asia/Manila";
  const dateInTimezone = moment.tz(timezone);

  // Return as a Moment object (preserves timezone)
  return dateInTimezone;

}
const formatDate = (seconds, nanoseconds) => {
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;

    return new Date(milliseconds);
}


export {
    formatDate,
    getCurrentDate
}