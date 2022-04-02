const { Router, Request, Response, NextFunction } = require('express')
const { verifyInfo } = require("../middlewares");
const ProjectService = require('../services/project.js');
/**
 * @apiDefine Project API
 *
 * Handles all Project operations.
 */
/**
 * @apiDefine JwtHeader JwtHeader    Header params to include to pass all JWT-protected routes
 *
 * @apiHeader {String}  cookie       Includes jwt token in `jwt` field, e.g. `jwt={token}`
 * @apiHeader {Boolean} credentials  Must be set to `true`
 */
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
    
  app.post(
    "/api/project/createProject",
    [
      verifyInfo.checkDuplicateProjectTitles
    ],
    ProjectService.createProject
  );

  app.get(
    "/api/project/allProjects",
    ProjectService.getAllProjects
  );

  app.get(
      "/api/project/projectsOwned",
      ProjectService.getProjectsOwned
  );

  app.get(
      "/api/project/:project_id",
      ProjectService.getProjectbyId
  );

  app.post(
  "/api/project/update/:project_id",
  ProjectService.updateProject
  );

  app.post(
  "/api/project/delete/:project_id",
  ProjectService.deleteProject
  );

  app.post(
  "/api/project/search",
  ProjectService.searchProjects
  );
};