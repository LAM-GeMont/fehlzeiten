import { Context } from '../../types'

export async function logoutUser ({ req }: Context) : Promise<void> {
  console.log(req.session)
  await new Promise<void>((resolve) => {
    req.session.destroy(resolve)
  })

  console.log(req.session)
}
