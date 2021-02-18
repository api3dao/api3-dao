import React, { useState } from "react";
import { Box, Typography } from "@material-ui/core";

import { ArrowForward, ArrowBack } from "components/@material-icons";

import useCommonStyles from "styles/common-styles";

const items: any = [
  {
    name: "",
    description: "#1 Tips explaining staking size of box small as possible while fitting all info"
  },
  {
    name: "",
    description: "#2 Tips explaining staking size of box small as possible while fitting all info"
  },
  {
    name: "",
    description: "#3 Tips explaining staking size of box small as possible while fitting all info"
  },
  {
    name: "",
    description: "#4 Tips explaining staking size of box small as possible while fitting all info"
  }
];

const iconStyles = {
  background: 'transparent',
  color: '#ffffff',
  
}

function Carousel(props: any) {
  const commonClasses = useCommonStyles();
  const [item, setItem] = useState<any | number>(0);

  const selectItem = (next: boolean) => {
    let selectedItem: any = item;
    if(next && selectedItem === items.length - 1 ) {
      selectedItem = 0
    }
    else if(next) {
      selectedItem = (selectedItem) + 1
    }
    
    if(!next && selectedItem === 0) {
      selectedItem = 0
    }
    else if(!next) {
      selectedItem = selectedItem - 1;
    }
    setItem(selectedItem);
  }
  
  const prev = () => {
    selectItem(false);
  }
  
  const next = () => {
    selectItem(true);
  }

  return (
    <Box padding="5%" className={commonClasses.borderContainer}> 
        <ArrowForward style={{...iconStyles, float: "right"}} onClick={next}/>
        <ArrowBack style={{...iconStyles, float: "left"}} onClick={prev}/>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
          <Typography variant="h2" color="secondary">{items[item].description}</Typography>
        </Box>      
    </Box>
  );
}

export default Carousel;