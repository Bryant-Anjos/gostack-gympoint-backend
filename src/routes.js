import { Router } from 'express'

import AnswerController from './app/controllers/AnswerController'
import CheckinController from './app/controllers/CheckinController'
import EnrollmentController from './app/controllers/EnrollmentController'
import QuestionController from './app/controllers/QuestionController'
import PlanController from './app/controllers/PlanController'
import SessionController from './app/controllers/SessionController'
import StudentController from './app/controllers/StudentController'
import UserController from './app/controllers/UserController'

import authMiddleware from './app/middleware/auth'

const routes = new Router()

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

routes.get('/students/:id/checkins', CheckinController.index)
routes.post('/students/:id/checkins', CheckinController.store)

routes.get('/students/:id/help-orders', QuestionController.index)
routes.post('/students/:id/help-orders', QuestionController.store)

routes.use(authMiddleware)

routes.put('/users', UserController.update)

routes.get('/students', StudentController.index)
routes.post('/students', StudentController.store)
routes.put('/students/:id', StudentController.update)

routes.get('/plans', PlanController.index)
routes.post('/plans', PlanController.store)
routes.put('/plans/:id', PlanController.update)
routes.delete('/plans/:id', PlanController.delete)

routes.get('/enrollments', EnrollmentController.index)
routes.get('/enrollments/:id', EnrollmentController.show)
routes.post('/enrollments', EnrollmentController.store)

routes.get('/help-orders', AnswerController.index)
routes.put('/help-orders/:id/answer', AnswerController.update)

export default routes
