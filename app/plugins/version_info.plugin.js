'use strict'

/**
 * Add git commit and docker tag details as headers to all responses
 *
 * With the access we have to our AWS ECS environment we cannot say for certain which docker image is being run. We can
 * make an assumption base on when the task definition was last updated and what image tag was selected in the Jenkins
 * job.
 *
 * But it's only an assumption. Plus, there are times, for example after deploying an update that a response might have
 * come from either the old or new image used for the ECS containers.
 *
 * So, we have created this plugin to read a git commit hash and a docker tag from env vars set when the image was
 * built. This information is then included in two customer headers we add to _every_ response from the API. The
 * delivery team can then use this information to help with debugging and investigating issues, and to confirm if a new
 * version has been successfully deployed.
 *
 * ## To `x-` or not to `x-`
 *
 * There is a "convention" of prefixing custom headers with an `x-`.
 * {@link http://tools.ietf.org/html/rfc6648|RFC 6648} deprecated that recommendation in 2012 and stated that custom
 * headers _SHOULD NOT_ use `x-`. The argument is that if a custom header becomes a standard removing the `x-` breaks
 * backwards compatibility.
 *
 * However, many have argued they never expect their custom headers to become standard. They are purely for use within
 * their own domain. Using `x-` puts them at less risk of conflicting with a customer header that does become a standard
 * in the future. Examples include
 * {@link https://cloud.google.com/load-balancing/docs/custom-headers|Google documentation} which still recommends using
 * `x-`. This {@link https://stackoverflow.com/q/3561381/6117745|stackoverflow post} includes detailed notes on the
 * topic of whether to add them or not.
 *
 * After reading through them, we have come to the decision to prefix our custom headers with `x-cma`. To new developers
 * and clients of the API aware of the convention it will be clear these are something custom we are adding to our
 * responses. We are also 100% confident these will never become standard, so the risk of breaking backwards
 * compatibility does not apply. The `-cma-` indicates it's a custom header set by us.
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
