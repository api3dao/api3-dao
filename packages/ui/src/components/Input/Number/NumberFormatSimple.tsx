import NumberFormat from 'react-number-format';

const styles = {
  fontSize: {
    fontSize: 16 
  }
}

const NumberFormatSimple = (props: any) => {
    const { inputRef, onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        style={styles.fontSize}
        getInputRef={inputRef}
        allowNegative={false}
        onValueChange={(values: any) => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        thousandSeparator
      />
    );
}

export default NumberFormatSimple;