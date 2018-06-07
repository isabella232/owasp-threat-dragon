'use strict';
var repository = {};
repository.github = require('../repositories/threatmodelgithubrepository');
repository.gitlab = require('../repositories/threatmodelgitlabrepository');
var threatmodelcontroller = {};

threatmodelcontroller.repos = function (req, res) {
    
    var page = req.query.page || 1;
    repository[req.user.profile.provider].repos(page, req.user.accessToken, function (err, data) {
        if (!err) {
            var responseRepos = [];
            data.repos.forEach(function (repo, index) {
                responseRepos[index] = repo.full_name;
            });
            res.send({repos: responseRepos, pagination: data.pagination});
        } else {
            res.status(err.statusCode || 500).json(err);
        }
    });
};

threatmodelcontroller.branches = function (req, res){
    
    var repoInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        page: req.query.page || 1
    };
    
    repository[req.user.profile.provider].branches(repoInfo, req.user.accessToken, function(err, data) {
        if(!err) {
            var baseUrl = 'https://github.com';
            var responseBranches = [];

            if(req.user.profile.provider=='gitlab'){
                baseUrl = process.env.GITLAB_URL;
            }

            data.branches.forEach(function (branch, index) {
                responseBranches[index] = branch.name;
            });

            res.send({branches: responseBranches, pagination: data.pagination, baseUrl:baseUrl});
        } else {
            res.status(err.statusCode || 500).json(err);
        }     
    }); 
};

threatmodelcontroller.models = function (req, res){
    
    var branchInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        branch: req.params.branch
    };
    
    repository[req.user.profile.provider].models(branchInfo, req.user.accessToken, function(err, data) {
        if(!err) {
            var baseUrl = 'https://github.com';
            var responseModels = [];

            if(req.user.profile.provider=='gitlab'){
                baseUrl = process.env.GITLAB_URL;
            }
            
            data.models.forEach(function (model, index) {
                responseModels[index] = model.name;
            });

            res.send({models:responseModels, baseUrl:baseUrl});
        } else {
            res.status(err.statusCode || 500).json(err);
        }     
    }); 
};
 
threatmodelcontroller.model = function (req, res) {
    var modelInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        branch: req.params.branch,
        model: req.params.model
    };

    repository[req.user.profile.provider].model(modelInfo, req.user.accessToken, function (err, data) {
        if (!err) {
            var model= (new Buffer(data.content, 'base64')).toString();
            res.send(model);
        } else {
            res.status(err.statusCode || 500).json(err);
        }
    });
};

threatmodelcontroller.create = function(req, res) {
    var modelInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        branch: req.params.branch,
        model: req.params.model,
        body: req.body        
    };
    
    repository[req.user.profile.provider].create(modelInfo, req.user.accessToken, function (err, data) {
        if (!err) {
            res.send(data);
        } else {
            res.status(err.statusCode || 500).json(err);
        }        
    }); 
};

threatmodelcontroller.update = function(req, res) {
    var modelInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        branch: req.params.branch,
        model: req.params.model,
        body: req.body        
    };
    
    repository[req.user.profile.provider].update(modelInfo, req.user.accessToken, function (err, data) {
        if (!err) {
            res.send(data);
        } else {
            res.status(err.statusCode || 500).json(err);
        }        
    }); 
};

threatmodelcontroller.deleteModel = function(req, res) {
    var modelInfo = {
        organisation: req.params.organisation,
        repo: req.params.repo,
        branch: req.params.branch,
        model: req.params.model,      
    };
    
    repository[req.user.profile.provider].deleteModel(modelInfo, req.user.accessToken, function (err, data) {
        if (!err) {
            res.send(data);
        } else {
            res.status(err.statusCode || 500).json(err);
        }        
    }); 
};
 
module.exports = threatmodelcontroller;