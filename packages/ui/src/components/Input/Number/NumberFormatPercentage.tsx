import NumberFormat from 'react-number-format';

const styles = {
  fontSize: {
    fontSize: 16 
  }
}

const NumberFormatPercentage = (props: any) => {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        style={styles.fontSize}
        getInputRef={inputRef}
        allowNegative={false}
        allowLeadingZeros={false}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        isAllowed={(values) => values.value === '' || parseInt(values.value) <= 100}
        suffix={" %"}
        isNumericString
      />
    );
}

export default NumberFormatPercentage; 