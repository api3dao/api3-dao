const counter = (distance: number): string => {
  // Time calculations for days, hours, minutes and seconds
  distance = Number(distance);
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const day = `${formattedTime(days)}:${formattedTime(hours)}:${formattedTime(minutes)}:${formattedTime(seconds)}`;
  // Whole countdown in the form of a formmated string;
  return day;
}

const formattedTime = (time: number | string ): (number | string) => {
  time = time < 10 ? `0${time}` : time
  return time;
}

export {
  counter,

}