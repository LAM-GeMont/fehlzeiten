import OAuth2Strategy from 'passport-oauth2'
import axios from 'axios'
import { Role, User } from './entity/User'
import env from 'dotenv-safe'
import path from 'path'

env.config({
  path: path.resolve(process.cwd(), '..', '.env'),
  example: path.resolve(process.cwd(), '..', '.env.example')
})

if (process.env.CLIENT_ID === undefined || process.env.CLIENT_SECRET === undefined) {
  throw new Error('CLIENT_ID AND/OR CLIENT_SECRET ARE NOT SET')
}

if (process.env.OAUTH_AUTHORIZATION_URL === undefined || process.env.OAUTH_TOKEN_URL === undefined) {
  throw new Error('OAUTH_AUTHORIZATION_URL AND/OR OAUTH_TOKEN_URL ARE NOT SET')
}

if (process.env.OAUTH_PROFILE_URL === undefined) {
  throw new Error('OAUTH_PROFILE_URL IS NOT SET')
}

export const oauthStrategy = new OAuth2Strategy({
  authorizationURL: process.env.OAUTH_AUTHORIZATION_URL!,
  tokenURL: process.env.OAUTH_TOKEN_URL!,
  clientID: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  callbackURL: process.env.OAUTH_CALLBACK_URL,
  scope: ['profile', 'openid', 'roles', 'uuid']
}, async (_accessToken: string, _refreshToken: string, params: any, profile: any, done: any) => {
  await axios.get(process.env.OAUTH_PROFILE_URL!, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.access_token}`
    }
  }).then((result: any) => {
    profile = result.data
  }).catch((e) => {
    console.error('Could not get profile data')
    console.error(e.message)
  })

  const roles = new Set()

  console.log(profile)

  for (const i in profile.roles) {
    roles.add(profile.roles[i].id)
  }

  return done(null, profile)
}
)

export async function serializeUser (user: any, done: any) {
  const u = await User.findOne({
    where: {
      iservUUID: user.uuid
    }
  })

  if (u != null) {
    if (user.roles.filter((r: any) => r.id === 'ROLE_KURSVERWALTUNG_WPU_LK').length > 0) {
      u.role = Role.COORDINATOR
    } else if (user.roles.filter((r: any) => r.id === 'ROLE_TEACHER').length > 0) {
      u.role = Role.TEACHER
    }
    await u.save()

    done(null, user.id)
  } else {
    const newUser = new User()
    newUser.name = user.preferred_username
    newUser.role = Role.TEACHER
    newUser.iservUUID = user.uuid
    newUser.save()
      .then(() => {
        done(null, newUser.id)
      })
  }
}

export async function deserializeUser (id: string, done: any) {
  const user = await User.findOne({
    where: {
      id: id
    }
  })

  if (user != null) {
    done(null, user.id)
  } else {
    done(null, null)
  }
}
