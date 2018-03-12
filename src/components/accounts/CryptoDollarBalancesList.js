import React from 'react';

const CryptoDollarBalancesList = (props) => {
  const balances = props.balances

  const listItems = balances.map((balance, index) => (
    <li key={index}>
      {balance}
    </li>
  ))

  return (
    <ul>{listItems}</ul>
  );
}

export default CryptoDollarBalancesList