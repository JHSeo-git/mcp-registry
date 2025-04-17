validate()

export const Env = {
  isDev: process.env.NODE_ENV !== "production",
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
  DOCKER_DOMAIN: process.env.DOCKER_DOMAIN!,
  DOCKER_USER: process.env.DOCKER_USER!,
  DOCKER_PASSWORD: process.env.DOCKER_PASSWORD!,
}

function validate() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set")
  }

  if (!process.env.DOCKER_DOMAIN) {
    throw new Error("DOCKER_DOMAIN is not set")
  }

  if (!process.env.DOCKER_USER) {
    throw new Error("DOCKER_USER is not set")
  }

  if (!process.env.DOCKER_PASSWORD) {
    throw new Error("DOCKER_PASSWORD is not set")
  }
}
