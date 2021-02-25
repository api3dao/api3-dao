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

const proposalStatusTime = (executed: boolean, startDate: Date, votingDurationMinutes: number = 15) => {
  if(!executed) {
    const now = new Date()
    const start = new Date(Number(startDate)*1000)
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + votingDurationMinutes);
    if(now.getTime() > end.getTime()) {
      console.log('time has ended')
      return true;
    }
  } else {
    return false 
  }
}

export {
  counter,
  proposalStatusTime,

}