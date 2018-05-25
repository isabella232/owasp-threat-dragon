'use strict';
var github = require('octonode');
var threatmodelrepository = {};

threatmodelrepository.repos = function (page, accessToken, cb) {

    var client = github.client(accessToken);
    client.me().repos(page, function(err, repos, headers){
        cb(err,{repos: repos, pagination: getPagination(page,headers)})
    });
};

threatmodelrepository.branches = function (repoInfo, accessToken, cb) {

    var client = github.client(accessToken);
    client.repo(getRepoFullName(repoInfo)).branches(repoInfo.page, function(err, branches, headers){
        cb(err,{branches: branches, pagination: getPagination(repoInfo.page,headers)})
    });
};

threatmodelrepository.models = function (branchInfo, accessToken, cb) {

    var client = github.client(accessToken);
    client.repo(getRepoFullName(branchInfo)).contents('ThreatDragonModels', branchInfo.branch, function (err,models){
        cb(err, {models: models})
    });
};

threatmodelrepository.model = function (modelInfo, accessToken, cb) {

    var path = getModelPath(modelInfo);
    var client = github.client(accessToken);
    client.repo(getRepoFullName(modelInfo)).contents(path, modelInfo.branch, cb);
};

threatmodelrepository.create = function (modelInfo, accessToken, cb) {

    var path = getModelPath(modelInfo);
    var client = github.client(accessToken);
    var message = 'Created by OWASP Threat Dragon';
    var content = getModelContent(modelInfo);
    client.repo(getRepoFullName(modelInfo)).createContents(path, message, content, modelInfo.branch, cb);
};

threatmodelrepository.update = function (modelInfo, accessToken, cb) {

    threatmodelrepository.model(modelInfo, accessToken, function (err, content) {

        if (err) {
            cb(err, null);
        } else {
            var path = getModelPath(modelInfo);
            var client = github.client(accessToken);
            var message = 'Updated by OWASP Threat Dragon';
            var newContent = getModelContent(modelInfo);
            client.repo(getRepoFullName(modelInfo)).updateContents(path, message, newContent, content.sha, modelInfo.branch, cb);
        }
    });
};

threatmodelrepository.deleteModel = function (modelInfo, accessToken, cb) {

    threatmodelrepository.model(modelInfo, accessToken, function (err, content) {

        if (err) {
            cb(err, null);
        } else {
            var path = getModelPath(modelInfo);
            var client = github.client(accessToken);
            var message = 'Deleted by OWASP Threat Dragon';
            client.repo(getRepoFullName(modelInfo)).deleteContents(path, message, content.sha, modelInfo.branch, cb);
        }
    });
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

//private methods
function getPagination(headers, page) {
    
    var pagination = { page: page, next: false, prev: false };
    var linkHeader = headers.link;
    
    if(linkHeader) {
        
        linkHeader.split(',').forEach(function(link) {
           if (isLinkType('"next"')) {
               pagination.next = true;
           }
           
           if (isLinkType('"prev"')) {
               pagination.prev = true;
           }
           
           function isLinkType(type) {
               return link.split(';')[1].split('=')[1] === type;
           }
        });
    }
    
    return pagination;  
}

module.exports = threatmodelrepository;