import * as Yup from 'yup'
import Student from '../models/Student'

class StudentController {
  async index(req, res) {
    const { page = 1 } = req.query

    const students = await Student.findAll({
      where: { user_id: req.userId },
      order: ['name'],
      attributes: ['id', 'name', 'email', 'birthday', 'height', 'weight'],
      limit: 10,
      offset: (page - 1) * 20,
    })

    return res.json(students)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birthday: Yup.date().required(),
      height: Yup.number()
        .min(0)
        .max(3),
      weight: Yup.number()
        .min(0)
        .max(999.99),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email, user_id: req.userId },
    })

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' })
    }

    const { id, name, email, birthday, height, weight } = await Student.create({
      ...req.body,
      user_id: req.userId,
    })

    return res.json({
      id,
      name,
      email,
      birthday,
      height,
      weight,
    })
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      height: Yup.number()
        .min(0)
        .max(3),
      weight: Yup.number()
        .min(0)
        .max(999.99),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const student = await Student.findOne({
      where: { id: req.params.id, user_id: req.userId },
    })

    if (req.body.email && req.body.email !== student.email) {
      const userExists = await Student.findOne({
        where: { email: req.body.email, user_id: req.userId },
      })

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' })
      }
    }

    const { id, name, email, height, weight } = await student.update(req.body, {
      fields: ['name', 'email', 'height', 'weight'],
    })

    return res.json({
      id,
      name,
      email,
      height,
      weight,
    })
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id)

    if (!student) {
      return res.status(400).json({ error: "Student doesn't exists." })
    }

    if (student.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to do this." })
    }

    await student.destroy()

    return res.json(student)
  }
}

export default new StudentController()
