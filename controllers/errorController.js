exports.respondInternalError = (error, req, res, next) => {
  console.log(error);
  res.render("errors/500error", {error: error, message: error.message});
};

exports.respondRouteNotFound = (req, res, next) => {
  res.status(404);
  res.render('errors/404error');
}