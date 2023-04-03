exports.respondInternalError = (error, req, res, next) => {
  res.render("errors/500", {error: error, message: error.message});
  //next(error);
};

exports.respondRouteNotFound = (req, res, next) => {
  res.status(404);
  res.render('errors/404');
}