'use strict';
const Gitlab = require('gitlab/dist/es5').default;
var threatmodelrepository = {};

function gitlabClient(accessToken) {
    return new Gitlab({url: process.env.GITLAB_URL || 'https://gitlab.com', oauthToken: accessToken});
}

threatmodelrepository.repos = function (page, accessToken, cb) {

    var client = gitlabClient(accessToken);

    client.Projects.all({page:page,owned:true}).then((projects) => {
        var repos = [];
        projects.forEach(project => {
            repos.push({full_name:project.path_with_namespace});
        });
        cb(null,{repos:repos,pagination:{next:false,prev:false,page:page}});
    }).catch(cb);
};

threatmodelrepository.branches = function (repoInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    client.Branches.all(getRepoFullName(repoInfo), {page:repoInfo.page}).then((branches) => {
        cb(null, {branches:branches,pagination: {next:false,prev:false,page:repoInfo.page}});
    }).catch(cb);
};

threatmodelrepository.models = function (branchInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    client.Repositories.tree(getRepoFullName(branchInfo), {ref:branchInfo.branch,path:'ThreatDragonModels/'}).then((models) => {
        cb(null, {models:models, pagination: {next:false,prev:false,page:branchInfo.page}});
    }).catch(cb);
};

threatmodelrepository.model = function (modelInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    client.RepositoryFiles.show(getRepoFullName(modelInfo),getModelPath(modelInfo),modelInfo.branch).then(model => {
        cb(null, model);
    }).catch(cb);
};

threatmodelrepository.create = function (modelInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    var message = 'Created by OWASP Threat Dragon';
    var content = getModelContent(modelInfo);
    client.RepositoryFiles.create(getRepoFullName(modelInfo), getModelPath(modelInfo), modelInfo.branch, {commit_message: message, content: content}).then(function(data){
        cb(null,data);
    }).catch(cb);
};

threatmodelrepository.update = function (modelInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    var message =  'Updated by OWASP Threat Dragon';
    var content = getModelContent(modelInfo);
    client.RepositoryFiles.edit(getRepoFullName(modelInfo), getModelPath(modelInfo), modelInfo.branch, {commit_message: message, content: content}).then(function(data){
        cb(null,data);
    }).catch(cb);
};

threatmodelrepository.deleteModel = function (modelInfo, accessToken, cb) {

    var client = gitlabClient(accessToken);

    var message =  'Updated by OWASP Threat Dragon';
    client.RepositoryFiles.remove(getRepoFullName(modelInfo), getModelPath(modelInfo), modelInfo.branch, {commit_message: message}).then(function(data){
        cb(null,data);
    }).catch(cb);
};

//private functions

function getRepoFullName(info) {
    return info.organisation + '/' + info.repo;
}

function getModelPath(modelInfo) {
    return 'ThreatDragonModels/' + modelInfo.model + '/' + modelInfo.model + '.json';
}

function getModelContent(modelInfo) {
    return JSON.stringify(modelInfo.body, null, '  ');
}

module.exports = threatmodelrepository;