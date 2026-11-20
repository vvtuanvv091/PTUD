const asyncHandler = (hamXuLy) => (req, res, next) => {
  Promise.resolve(hamXuLy(req, res, next)).catch(next);
};

module.exports = asyncHandler;
