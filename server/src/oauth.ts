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

export const oauthStrategy = new OAuth2Strategy({
  authorizationURL: 'https://gemont.de/iserv/oauth/v2/auth',
  tokenURL: 'https://gemont.de/iserv/oauth/v2/token',
  clientID: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  callbackURL: 'https://localhost:4000/api/callback',
  scope: ['profile', 'email', 'openid', 'roles', 'groups', 'uuid']
}, async (_accessToken: string, _refreshToken: string, params: any, profile: any, done: any) => {
  await axios.get('https://gemont.de/iserv/public/oauth/userinfo', {
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

  for (const i in profile.roles) {
    roles.add(profile.roles[i].id)
  }

  return done(null, profile)
}
)

export async function serializeUser (user: any, done: any) {
  const u = await User.findOne({
    where: {
      name: user.preferred_username
    }
  })

  if (u != null) {
    if (u.iservUUID === user.uuid) {
      done(null, u.id)
    } else {
      done(null, null)
    }
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
