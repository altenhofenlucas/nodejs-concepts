const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// function logRequest(req, res, next) {
//   const { method, url } = req;
//   const logMessage = `[${method.toUpperCase()}] ${url}`;
  
//   console.time(logMessage);
//   next();
//   console.timeEnd(logMessage);
// }

// app.use(logRequest);

function validateRepositoryIdParam(request, response, next) {
  const { id } = request.params;

  if (!id || !isUuid(id)) {
    return response.status(400).json({
      error: 'Check the ID param, is required!'
    });
  }

  return next();
}

function validateRepositoriesEmpty(request, response, next) {
  if (!repositories || !Array.isArray(repositories) || !repositories.length) {
    return response.status(400).json({
      error: 'No repository saved yet! save the first one...'
    });
  }

  return next();
}

function validateRepositoryFound(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex( repo => repo.id === id);

  if(repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repository not found! check if the ID param is correct and try again...'
    });
  }

  request.params.repositoryIndex = repositoryIndex;
  return next();
}

app.get("/repositories", validateRepositoriesEmpty, (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", createRepository);

app.put("/repositories/:id", validateRepositoryIdParam, validateRepositoryFound, updateRepository);

app.delete("/repositories/:id", validateRepositoryIdParam, validateRepositoryFound, deleteRepository);

app.post("/repositories/:id/like", validateRepositoryIdParam, validateRepositoryFound, likeRepository);

function createRepository(request, response) {
  const { title, url, techs } = request.body;

  const newRepository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(newRepository);

  return response.status(201).json(newRepository);
}

function updateRepository(request, response) {
  const { id, repositoryIndex } = request.params;
  const {title, url, techs} = request.body;

  const { likes } = repositories[repositoryIndex];

  const updatedRepository = {
    id,
    url,
    title,
    techs,
    likes,
  }

  repositories[repositoryIndex] = updatedRepository;

  return response.status(200).json(repositories[repositoryIndex]);
}

function deleteRepository(request, response) {
  const { repositoryIndex } = request.params;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
}

function likeRepository(request, response) {
  const { repositoryIndex } = request.params;

  repositories[repositoryIndex].likes += 1;

  return response.status(200).json(repositories[repositoryIndex]);
}

module.exports = app;
