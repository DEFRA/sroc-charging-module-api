'use strict'

/**
 * @module VersionInfoPlugin
 */

const addGitCommitHeader = response => {
  const value = process.env.GIT_COMMIT || 'unknown'

  response.header('x-cma-git-commit', value)
}

const addDockerTagHeader = response => {
  const value = process.env.DOCKER_TAG || 'unknown'

  response.header('x-cma-docker-tag', value)
}

const VersionInfoPlugin = {
  name: 'version_info',
  register: (server, _options) => {
    server.ext('onPreResponse', (request, h) => {
      const response = request.response

      addGitCommitHeader(response)
      addDockerTagHeader(response)

      return response
    })
  }
}

module.exports = VersionInfoPlugin
