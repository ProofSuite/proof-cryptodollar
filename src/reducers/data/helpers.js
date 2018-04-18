export const removeByKey = (myObj, deleteKey) => {
  deleteKey = String(deleteKey)
  return Object.keys(myObj)
    .filter(key => key !== deleteKey)
    .reduce((result, current) => {
      result[current] = myObj[current]
      return result
    }, {})
}

export const removeByKeys = (myObj, deleteKeys) => {
  return Object.keys(myObj)
    .filter(key => deleteKeys.indexOf(key) === -1)
    .reduce((result, current) => {
      result[current] = myObj[current]
      return result
    }, {})
}

export const addByKey = (myObj, addKey, addObject) => {
  return {
    ...myObj,
    [addKey]: addObject
  }
}
