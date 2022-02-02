// // const { Pool, RowDataPacket } = require('mysql2/promise')
// // const mysql = require('mysql2/promise')
// // const { Project, ProjectDetails, Contract } = require('../../types.ts')
// // const SQL = require('./sql.js')
// // // const conn = require('../../db/index.js')
// // const { algoliasearch, SearchIndex } = require('algoliasearch')
// // const { ALGOLIA_APP_ID, ALGOLIA_API_KEY } = require('../../config/index.js')

const config = require('../config/index.js');
const User = require('../models/user.js')
const Project = require('../models/project.js')

const jwt = require('jsonwebtoken');

// probably want to be able to pass leadership or owner_id
exports.createProject = (req, res) => {
    const project = new Project({
        title: req.body.title,
        owner_id: req.id,
        size: req.body.size,
        team: [req.id],
        location: req.body.location,
        status: 'New',
        duration: {
            length: req.body.duration.length,
            created_date: new Date(Date.now()) },
        updated_at: new Date(Date.now()),
        description: req.body.description,
        skill: req.body.skill,
        roles: req.body.roles,
        categories: req.body.categories
    });

    project.save((err, project) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.json({ message: "Project was added successfully!",
                    project_id: project._id});
    });
}

exports.getAllProjects = (req,res) => {
    Project.find({ })
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.json(projects);
      });
};
//
// exports.getProjectsArray = (req,res) => {
//     Project.find({ })
//            .exec((err, projects) => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }
//           result=projects.toArray();
//           res.send(result);
//       });
// };

exports.getProjectbyId = (req,res) => {
    Project.find({ _id: req.params.project_id })
           .exec((err, project) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.json({ project });
      });
};

exports.getProjectsOwned = (req,res) => {
    Project.find({ owner_id: req.id })
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.json({ projects });
      });
};

// update project, delete project 

exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.project_id)
        if(!project){
            res.status(400).send({message: "Project does not exist!"});
            return;
        }
        if (project.owner_id != req.id) {
            res.status(400).send({ message: "Project is not owned by this user!"});
            return;
        }
        else {
            project = await Project.findOneAndUpdate({_id: req.params.project_id}, req.body, {
                new: true,
                runValidators: true
            })
            res.json({project})
        }
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.deleteProject = async(req, res)=> {
    try {
        let project = await Project.findById(req.params.project_id)
        if (project._id != req.params.project_id) {
            res.status(400).send({ message: "Project is not owned by this user!"});
            return;
        }
        await Project.deleteOne({_id:req.params.project_id})
        res.send({ message: "Project was deleted successfully!" });
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.searchProjects = async(req, res)=> {
    try {
        query = { title: {$regex: new RegExp(req.body.search_term, "i")}}
        if(req.body.size) {query["size"] = req.body.size}
        if(req.body.status) {query["status"] = req.body.status}
        if(req.body.duration) {query["duration"] = req.body.duration}
        if(req.body.categories){query["categories"] = req.body.categories}
        if(req.body.role_titles){query["roles.title"] = req.body.role_titles}

        Project.find(query)
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.json({ projects });
        });
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

//
// exports.updateProject = (req, res) => {
//     for (var field in req.body) {
//         console.log(field+": "+ req.body[field]);
//         Project.update(
//             { _id: req.params.project_id },
//             { $set:
//                 {
//                     {field}: req.body[field]
//                 }
//             }
//         );
//     }
//     res.json({ message: "Project was attempted to update",
//                project_id: req.params.project_id});

    // Project.update({ _id: req.params.project_id },
    //                {$set: {}}
    // )
    //        .exec((err, projects) => {
    //       if (err) {
    //         res.status(500).send({ message: err });
    //         return;
    //       }
    //       res.json({ projects });
    //   });
// }

// //   async validateOwner (projectId, username) {
// //       const [res] = await this.db.execute(SQL.getOwnerUsername, [projectId]);
// //       if (!res[0] || username != res[0].username) {
// //         throw new Error('Unauthorized operation on project.');
// //       }
// //   }
// // // //
//
// // //
// // //   async function getProjectDetails(projectId) {
// // //     try {
// // //       const [res] = await this.db.execute(SQL.getProjectDetailsById, [projectId]);
// // //       // let projectDetails = ProjectDetails;
// // //
// // //       if (res[0]) {
// // //         projectDetails = {
// // //           owner: {
// // //             user: { username: res[0].ownerUsername },
// // //             firstName: res[0].ownerFirstName,
// // //             lastName: res[0].ownerLastName,
// // //             email: res[0].ownerEmail,
// // //           },
// // //           title: res[0].title,
// // //           description: res[0].description,
// // //           status: res[0].status,
// // //           duration: res[0].duration,
// // //           size: res[0].size,
// // //           postal: res[0].postal,
// // //           createdAt: res[0].createdAt,
// // //           updatedAt: res[0].updatedAt,
// // //         };
// // //       }
// // //
// // //       return projectDetails;
// // //     } catch (err) {
// // //       throw err;
// // //     }
// // //   }
//
// // //
// // //   async function getProject(projectId) {
// // //     try {
// // //       const projectDetails = await this.getProjectDetails(projectId);
// // //       if (!projectDetails) {
// // //         return null;
// // //       }
// // //
// // //       const [skillsRes] = await this.db.execute(SQL.getProjectSkills, [projectId]);
// // //       const [rolesRes] = await this.db.execute(SQL.getProjectRoles, [projectId]);
// // //       const [interestsRes] = await this.db.execute(SQL.getProjectInterests, [projectId]);
// // //
// // //       const exercises = {};
// // //       (rolesRes as RowDataPacket[])
// // //         .filter(row => Boolean(row.exercise))
// // //         .forEach(row => {
// // //           exercises[row.role] = row.exercise;
// // //         });
// // //
// // //       const project = {
// // //         details : projectDetails,
// // //         skills: (skillsRes as RowDataPacket[]).map(row => row.skill),
// // //         roles: (rolesRes as RowDataPacket[]).map(row => row.role),
// // //         interests: (interestsRes as RowDataPacket[]).map(row => row.interest),
// // //         exercises,
// // //       };
// // //
// // //       return project;
// // //     } catch (err) {
// // //       throw err;
// // //     }
// // //   }
// // //
// // //   async function getProjectContracts(username, projectId) {
// // //     await this.validateOwner(projectId, username);
// // //
// // //     try {
// // //       const [contractsRes] = await this.db.execute(SQL.getProjectContracts, [projectId]);
// // //
// // //       const contracts: Contract[] = (contractsRes as RowDataPacket[]).map(c => ({
// // //         contractId: c.contractId,
// // //         startDate: c.startDate,
// // //         endDate: c.endDate,
// // //         status: c.status,
// // //         student: {
// // //           firstName: c.firstName,
// // //           lastName: c.lastName,
// // //           user: {
// // //             username: c.username,
// // //           },
// // //         },
// // //       }));
// // //
// // //       return contracts;
// // //     } catch (err) {
// // //       throw err;
// // //     }
// // //   }
// // //
// // //   // async function updateProject(username, projectId, project) {
// // //   //   await this.validateOwner(projectId, username);
// // //   //   const { details, skills, roles, interests, exercises } = project;
// // //   //   const conn = await this.db.getConnection();
// // //   //
// // //   //   try {
// // //   //     conn.beginTransaction();
// // //   //
// // //   //     if (details) {
// // //   //       const params = [
// // //   //         details.title || null,
// // //   //         details.description || null,
// // //   //         details.size || null,
// // //   //         details.duration || null,
// // //   //         details.status || null,
// // //   //         details.postal || null,
// // //   //         projectId,
// // //   //       ];
// // //   //       await conn.execute(SQL.updateProjectDetails, params);
// // //   //     }
// // //   //
// // //   //     if (skills && skills.length) {
// // //   //       await conn.execute(SQL.addToArrayCatalog('skill', skills), skills);
// // //   //       await conn.execute(SQL.deleteOldProjectArrayItems('skill', skills), [projectId, ...skills]);
// // //   //       await conn.execute(SQL.insertNewProjectArrayItems('skill', skills), [projectId, ...skills]);
// // //   //     } else {
// // //   //       await conn.execute(SQL.deleteProjectSkills, [projectId]);
// // //   //     }
// // //   //
// // //   //     if (roles && roles.length) {
// // //   //       await conn.execute(SQL.addToArrayCatalog('role', roles), roles);
// // //   //       await conn.execute(SQL.deleteOldProjectArrayItems('role', roles), [projectId, ...roles]);
// // //   //       await conn.execute(SQL.insertNewProjectArrayItems('role', roles), [projectId, ...roles]);
// // //   //     } else {
// // //   //       await conn.execute(SQL.deleteProjectRoles, [projectId]);
// // //   //     }
// // //   //
// // //   //     if (interests && interests.length) {
// // //   //       await conn.execute(SQL.addToArrayCatalog('interest', interests), interests);
// // //   //       await conn.execute(SQL.deleteOldProjectArrayItems('interest', interests), [projectId, ...interests]);
// // //   //       await conn.execute(SQL.insertNewProjectArrayItems('interest', interests), [projectId, ...interests]);
// // //   //     } else {
// // //   //       await conn.execute(SQL.deleteProjectInterests, [projectId]);
// // //   //     }
// // //   //
// // //   //     if (exercises && Object.keys(exercises).length) {
// // //   //       const excParams = Object.entries(exercises).reduce((arr, cur) => [...arr, ...cur], []);
// // //   //       await conn.execute(SQL.deleteProjectExercises, [projectId]);
// // //   //       await conn.execute(SQL.updateProjectExercises(Object.keys(exercises)), [...excParams, projectId]);
// // //   //     }
// // //   //
// // //   //     await conn.commit();
// // //   //     conn.release();
// // //   //   } catch (err) {
// // //   //     await conn.rollback();
// // //   //     conn.release();
// // //   //     throw err;
// // //   //   }
// // //   // }
// // //
// // //   async function deleteProject(username, projectId) {
// // //     await this.validateOwner(projectId, username);
// // //     const conn = await this.db.getConnection();
// // //
// // //     try {
// // //       conn.beginTransaction();
// // //       await conn.execute(SQL.deleteProjectContracts, [projectId]);
// // //       await conn.execute(SQL.deleteProjectSaved, [projectId]);
// // //       await conn.execute(SQL.deleteProjectSkills, [projectId]);
// // //       await conn.execute(SQL.deleteProjectRoles, [projectId]);
// // //       await conn.execute(SQL.deleteProjectInterests, [projectId]);
// // //       await conn.execute(SQL.deleteProject, [projectId]);
// // //       await conn.commit();
// // //       conn.release();
// // //
// // //       this.searchIndex.deleteObject(projectId);
// // //     } catch (err) {
// // //       await conn.rollback();
// // //       conn.release();
// // //       throw err;
// // //     }
// // //   }
// // //
// // //   async function indexProject(projectId, project) {
// // //     const { title, size, duration, postal, status } = project.details;
// // //     const { skills, roles, interests } = project;
// // //
// // //     this.searchIndex.saveObject({
// // //       objectID: projectId,
// // //       title,
// // //       status,
// // //       teamSize: size,
// // //       duration,
// // //       postal,
// // //       skills,
// // //       roles,
// // //       interests,
// // //       date: new Date().toISOString(),
// // //     });
// // //   }
// // //
// // //   async function updateProjectIndex(projectId, project) {
// // //     const { details, skills, roles, interests } = project;
// // //     const { object } = await this.searchIndex.getObject(projectId);
// // //
// // //     this.searchIndex.partialUpdateObject({
// // //       objectID: projectId,
// // //       title: details.title,
// // //       status: details.status || object.status,
// // //       teamSize: details.size || object.teamSize,
// // //       duration: details.duration || object.duration,
// // //       postal: details.postal || object.postal,
// // //       skills,
// // //       roles,
// // //       interests,
// // //     });
// // //   }
// // }
// //
// // module.exports = ProjectService;
