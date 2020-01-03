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

    const studentExists = await Student.findByPk(req.userId)

    if (!studentExists) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    const helpOrder = await HelpOrder.create({
      student_id: req.userId,
      question: req.body.question,
    })

    const question = await HelpOrder.findByPk(helpOrder.id, {
      attributes: ['id', 'question', 'answer', 'answer_at', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    })

    const { user_id } = studentExists
    const instructorSocket = req.connectedInstructors[user_id]

    if (instructorSocket) {
      req.io.to(instructorSocket).emit('question', question)
    }

    return res.json(helpOrder)
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.userId },
      order: [['id', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    })

    return res.json(helpOrders)
  }
}

export default new QuestionController()
