const { Router, Request, Response, NextFunction } = require('express')
const passport = require('passport');
const { verifyInfo, authJwt } = require("../middlewares");
const ProjectService = require('../services/project.js');
const { JWT_SECRET, FE_ADDR, DOMAIN } = require('../config/index.js');
const Project = require('../models/project.js')
/**
 * @apiDefine Project API
 *
 * Handles all Project Profile operations.
 */

// const updateProject = (srv: ProjectService) => async (req: Request, res: Response): Promise<void> => {
//   const { projectId } = req.params;
//   const project = req.body as Project;
//   const { username } = req.user as User;
//
//   try {
//     await srv.updateProject(username, projectId, project);
//     await srv.updateProjectIndex(projectId, project);
//     res.json({ success: `Project id: ${projectId} updated.` });
//   } catch (error) {
//     res.json({
//       error: (error as Error).message,
//     });
//   }
// };
//
// const deleteProject = (srv: ProjectService) => async (req: Request, res: Response): Promise<void> => {
//   const { projectId } = req.params;
//   const { username } = req.user as User;
//
//   try {
//     await srv.deleteProject(username, projectId);
//     res.json({ success: `Project id: ${projectId} deleted from database.` });
//   } catch (error) {
//     res.json({
//       error: (error as Error).message,
//     });
//   }
// };
//

module.exports = function(app) {
      app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });

      /**
     * @api {post} api/project/createProject  Create a new Project
     * @apiGroup NexusBuilders
     * @apiName CreateProject
     *
     * @apiUse JwtHeader
     *
     * @apiParam {String} title                 Project title
     * @apiParam {String} size                  Project size
                                    ['Micro','Small','Medium','Large']
     * @apiParam {String} location              Project location
     * @apiParam {String} duration              Project duration
        ['1-3 months','3-6 months','6-9 months', 'More than 9 months']
     * @apiParam {String} description           Project description
     * @apiParam [{String}] categories          Project categories
     * @apiParam [Array] Roles                  Project roles
              - {String} Title                  Role title
              - [{String}] skill                Role skills
     *
     * @apiSuccess
     *        Return success message with {Number}--projectId Project ID
     **/
    app.post(
         "/api/project/createProject",
         [
           authJwt, verifyInfo.checkDuplicateProjectTitles
         ],
         ProjectService.createProject
    );

    /**
   * @api {get} api/project/allProjects    Fetch all projects
   * @apiGroup NexusBuilders
   * @apiName AllProjects
   *
   * @apiUse JwtHeader
   *
   * @apiParam {}
   *
   * @apiSuccess
   *        Return json detailing all existing public projects
   **/
    app.get(
         "/api/project/allProjects",
         ProjectService.getAllProjects
    );


    /**
    * @api {get} api/project/projectsOwned    Fetch projects owned by user
    * @apiGroup NexusBuilders
    * @apiName ProjectsOwned
    *
    * @apiUse JwtHeader
    *
    * @apiParam {user._id} req.id               User ID
    *
    * @apiSuccess
    *         Return json detailing all projects owned by user
    **/
    app.get(
         "/api/project/projectsOwned",
         [
           authJwt
         ],
         ProjectService.getProjectsOwned
    );

    /** UPDATE PROJECT DOCUMENT
    * @api {get} api/project/updateProject         Update chosen project
    * @apiGroup NexusBuilders
    * @apiName UpdateProject
    *
    * @apiUse JwtHeader
    *
    * @apiParam {String} title                 Project title
    * @apiParam {String} size                  Project size
                                   ['Micro','Small','Medium','Large']
    * @apiParam {String} location              Project location
    * @apiParam {String} duration              Project duration
       ['1-3 months','3-6 months','6-9 months', 'More than 9 months']
    * @apiParam {String} description           Project description
    * @apiParam [{String}] categories          Project categories
    * @apiParam [Array] Roles                  Project roles
             - {String} Title                  Role title
             - [{String}] skill                Role skills
    *
    * @apiSuccess json detailing all projects owned by user
    // **/
    // app.post(
    //      "/api/project/update/:project_id",
    //      ProjectService.updateProject
    // );

    /**
    * @api {get} api/project/:project_id    Fetch project by its ID
    * @apiGroup NexusBuilders
    * @apiName ProjectsOwned
    *
    * @apiUse JwtHeader
    *
    * @apiParam project_id               Project ID
    *
    * @apiSuccess
    *     Return json containing details of project given its ID
    **/
    app.get(
         "/api/project/:project_id",
         ProjectService.getProjectbyId
    );
    
    // NEED TO BE TESTED + how to deal with delete and etc
    app.post(
      "/api/project/update/:project_id",
      [
        authJwt
      ],
      ProjectService.updateProject
    );
    
    app.post(
      "/api/project/delete/:project_id",
      [
        authJwt
      ],
      ProjectService.deleteProject
    );

    app.post(
      "/api/project/search",
      ProjectService.searchProjects
    );
};

// TODO: apidoc
// router.get('/owned', getProjectsOwned(projectService));

/**
 * @api {get} /projects/:projectId Get Project
 * @apiGroup ProjectGroup
 * @apiName GetProject
 *
 * @apiUse JwtHeader
 *
 * @apiParam {String} projectId Project ID
 *
 * @apiSuccess {Object} details              Project details
 * @apiSuccess {String} details.title        Project title
 * @apiSuccess {String} details.description  Project description
 * @apiSuccess {String} details.status       Project status
 * @apiSuccess {String} details.duration     Project duration
 * @apiSuccess {String} details.size         Project team size
 * @apiSuccess {String} details.postal       Project postal code
 * @apiSuccess {Date} details.createdAt      Project created date
 * @apiSuccess {Date} details.updatedAt      Project updated date
 * @apiSuccess {String[]} skills             Project skills
 * @apiSuccess {String[]} roles              Project roles
 * @apiSuccess {String[]} interests          Project interests
 */
// router.get('/:projectId', getProjectById(projectService));

/**
 * @api {patch} /projects/:projectId Update Project
 * @apiGroup ProjectGroup
 * @apiName UpdateProject
 *
 * @apiUse JwtHeader
 *
 * @apiParam {String} projectId Project ID
 *
 * @apiParam {Object} details                Project details
 * @apiParam {String} [details.title]        Project title
 * @apiParam {String} [details.description]  Project description
 * @apiParam {String} [details.status]       Project status
 * @apiParam {String} [details.duration]     Project duration
 * @apiParam {String} [details.size]         Project team size
 * @apiParam {String} [details.postal]       Project postal code
 * @apiParam {String[]} skills               Project skills
 * @apiParam {String[]} roles                Project roles
 * @apiParam {String[]} interests            Project interests
 */
// router.patch('/:projectId', updateProject(projectService));

/**
 * @api {delete} /projects/:projectId Delete Project
 * @apiGroup ProjectGroup
 * @apiName DeleteProject
 *
 * @apiUse JwtHeader
 */
// router.delete('/:projectId', deleteProject(projectService));

// TODO: apidoc
// router.get('/:projectId/contracts', getProjectContracts(projectService));

// module.exports = router;
