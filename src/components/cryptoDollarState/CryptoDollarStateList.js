import React from 'react';

const CryptoDollarStateList = (props) => {
  const variablesList = props.contractState.map((variable, index) => (
    <li key={index}>
      {variable.name}: {variable.value}
    </li>
  ))

  return (
    <ul>
      {variablesList}
    </ul>
  )
};

export default CryptoDollarStateList;