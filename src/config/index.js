const config = {}
const env = process.env.NODE_ENV

switch (env) {
  case 'development':
    Object.assign(config, {
      host: 'https://ygz-dev-service.hiworld.com'
    })
    break
  case 'production':
    Object.assign(config, {
      host: 'https://test-service.hiworld.com'
    })
    break
  case 'deployment':
    Object.assign(config, {
      host: 'https://service.hiworld.com'
    })
    break
  default:
    break
}

export default config
