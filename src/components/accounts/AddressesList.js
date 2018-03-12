import React from 'react';

const AddressesList = (props) => {
  const addresses = props.addresses

  const listItems = addresses.map((address, index) => (
    <li key={index}>
      {address}
    </li>
  ))

  return (
    <ul>{listItems}</ul>
  );
}

export default AddressesList