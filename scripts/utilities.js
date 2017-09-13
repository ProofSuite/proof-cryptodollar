Number.prototype.toEther = function() {
  return this / (10**18)
}

Number.prototype.toWei = function() {
  return this * (10**18)
}