exports.respondInternalError = (error, req, res, next) => {
  res.render("error", {error: error, message: error.message});
  //next(error);
};

exports.respondRouteNotFound = (req, res, next) => {
  console.log("NOT FOUND")
  res.status(404);
  const msg = req.url + " is not an available route"
  res.render('error', {message: msg});
}