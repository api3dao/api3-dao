import NumberFormat from 'react-number-format';

const styles = {
  fontSize: {
    fontSize: 16 
  }
}

const NumberFormatCustom = (props: any) => {
    const { inputRef, onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        style={styles.fontSize}
        getInputRef={inputRef}
        allowNegative={false}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        thousandSeparator
        suffix={" API3"}
        // isNumericString
      />
    );
}

export default NumberFormatCustom;