/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const ScansController = () => import('#controllers/scans_controller')
const FindingsController = () => import('#controllers/findings_controller')

router.group(() => {
  router.post('/scans', [ScansController, 'create'])
  router.get('/scans/:id', [ScansController, 'show'])
  router.get('/scans/:id/findings', [ScansController, 'getFindings'])
  router.get('/scans/:id/score', [ScansController, 'getScore'])

  router.post('/findings/:id/explain', [FindingsController, 'explain'])
}).prefix('/api')

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
