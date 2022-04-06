const Project = require('../models/project.js')

let userPopulateQuery = [{path:'owner_id', select:['first_name','last_name']},
    {path:'team.user_id', select:['first_name','last_name']}]

exports.createProject = (req, res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
    const project = new Project({
        title: req.body.title,
        owner_id: req.id,
        size: req.body.size,
        team: [{user_id: req.id, role: "Project Owner"}],
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
            res.status(500).send({ message: err.message });
            return;
        }
        res.json({ message: "Project was added successfully!",
                    project_id: project._id});
    });
}

exports.getAllProjects = (req,res) => {
    Project.find({ }).populate(userPopulateQuery)
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err.message });
            return;
          }
          res.json(filterProjects(req.id, projects));
      });
};

exports.getProjectbyId = (req,res) => {
    Project.findOne({ _id: req.params.project_id }).populate(userPopulateQuery)
        .exec((err, project) => {
          if (err) {
            res.status(500).send({ message: err.message });
            return;
          }
          res.json(filterProjects(req.id, [project])[0]);
      });
};

exports.getProjectsOwned = (req,res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
    Project.find({ owner_id: req.id }).populate(userPopulateQuery)
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err.message });
            return;
          }
          res.json(projects);
      });
};

exports.updateProject = async (req, res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
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
            req.body.updated_at = new Date(Date.now())
            project = await Project.findOneAndUpdate({_id: req.params.project_id}, req.body, {
                new: true,
                runValidators: true
            })
            res.json(project)
        }
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.deleteProject = async(req, res)=> {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
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
        await Project.deleteOne({_id:req.params.project_id})
        res.send({ message: "Project was deleted successfully!" });
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.searchProjects = async(req, res)=> {
    try {
        queryTitle = { title: {$regex: new RegExp(req.body.search_term, "i")}}
        queryRoleTitle = { "roles.title": {$regex: new RegExp(req.body.search_term, "i")}}
        query = { $or: [ queryTitle, queryRoleTitle ] }

        if(req.body.size) {query["size"] = req.body.size}
        if(req.body.status) {query["status"] = req.body.status}
        if(req.body.duration) {query["duration"] = req.body.duration}
        if(req.body.categories){query["categories"] = req.body.categories}
        if(req.body.role_types){query["roles.type"] = req.body.role_types}

        Project.find(query).populate(userPopulateQuery)
           .exec((err, projects) => {
          if (err) {
            res.status(500).send({ message: err.message });
            return;
          }
          res.json(filterProjects(req.id, projects));
        });
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

// HELPER FUNCTIONS
function filterProjects(userId, projects) {
    let filteredProjects = []
    projects.forEach(project => {
        if (!userId || !project.team.some(user => user.user_id && user.user_id._id == userId)) {
            project.team = undefined
            project.roles = project.roles.filter(role => !role.private)
        }
        filteredProjects.push(project)
    });
    return filteredProjects
}