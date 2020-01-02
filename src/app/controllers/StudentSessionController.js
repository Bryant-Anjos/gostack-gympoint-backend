import jwt from 'jsonwebtoken'

import Student from '../models/Student'
import authConfig from '../../config/auth'

class StudentSessionController {
  async store(req, res) {
    const student = await Student.findByPk(req.params.id)

    if (!student) {
      return res.status(401).json({ error: 'User not found' })
    }

    const { id, name } = student

    return res.json({
      user: {
        id,
        name,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expires,
      }),
    })
  }
}

export default new StudentSessionController()
