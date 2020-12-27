import Aragon from "services/aragon";

export class Voting {
  constructor() {
    const aragon = Aragon.getInstance();
    console.log('aragon', aragon);
  }
}

export default Voting;
