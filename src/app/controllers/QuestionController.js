import * as Yup from 'yup'

import HelpOrder from '../models/HelpOrder'
import Student from '../models/Student'

class QuestionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const { id: student_id } = req.params

    const studentExists = await Student.findByPk(student_id)

    if (!studentExists) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    const { id, question } = await HelpOrder.create({
      student_id,
      question: req.body.question,
    })

    return res.json({
      id,
      student_id,
      question,
    })
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      limit: 20,
      offset: (page - 1) * 20,
    })

    return res.json(helpOrders)
  }
}

export default new QuestionController()
