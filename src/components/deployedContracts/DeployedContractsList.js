import React from 'react';

const DeployedContractsList = (props) => {
  const contractList = props.contracts.map((contract, index) => (
    <li key={index}>
      {contract.name}: {contract.address}
    </li>
  ))

  return (
    <ul>
      {contractList}
    </ul>
  )
};

export default DeployedContractsList;