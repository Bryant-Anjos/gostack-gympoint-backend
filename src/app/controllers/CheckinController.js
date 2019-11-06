import { Op } from 'sequelize'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import Checkin from '../models/Checkin'

class CheckinController {
  async store(req, res) {
    const { id: student_id } = req.params
    const today = new Date()

    const checkinExists = await Checkin.findOne({
      where: {
        student_id,
        created_at: { [Op.between]: [startOfDay(today), endOfDay(today)] },
      },
    })

    if (checkinExists) {
      return res.status(400).json({ error: 'Checkin already exists.' })
    }

    const checkinsAmount = await Checkin.count({
      where: {
        created_at: { [Op.between]: [startOfWeek(today), endOfWeek(today)] },
      },
    })

    if (checkinsAmount >= 5) {
      return res.status(401).json({ error: 'Maximum allowed checkins reached' })
    }

    const checkin = await Checkin.create({ student_id })

    return res.json(checkin)
  }

  async index(req, res) {
    const { page = 1 } = req.query

    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', 'created_at'],
      limit: 20,
      offset: (page - 1) * 20,
    })

    return res.json(checkins)
  }
}

export default new CheckinController()
