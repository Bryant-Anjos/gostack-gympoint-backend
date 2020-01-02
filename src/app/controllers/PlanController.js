import * as Yup from 'yup'
import Plan from '../models/Plan'

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query

    const plans = await Plan.findAll({
      where: { user_id: req.userId, active: true },
      order: ['duration'],
      attributes: ['id', 'title', 'duration', 'price'],
      limit: 10,
      offset: (page - 1) * 10,
    })

    return res.json(plans)
  }

  async show(req, res) {
    const plan = await Plan.findByPk(req.params.id, {
      attributes: ['id', 'title', 'duration', 'price', 'active'],
    })

    if (!plan || !plan.active) {
      return res.status(400).json({ error: "Plan doesn't exists." })
    }

    return res.json(plan)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .integer()
        .positive(),
      price: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
        user_id: req.userId,
      },
    })

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists.' })
    }

    const { id, title, duration, price, user_id } = await Plan.create({
      ...req.body,
      user_id: req.userId,
    })

    return res.json({
      id,
      title,
      duration,
      price,
      user_id,
    })
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .positive(),
      price: Yup.number(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' })
    }

    const plan = await Plan.findOne({
      where: { id: req.params.id, user_id: req.userId },
    })

    if (req.body.title && req.body.title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title: req.body.title, user_id: req.userId },
      })

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exists.' })
      }
    }

    const { id, title, duration, price } = await plan.update(req.body, {
      fields: ['title', 'duration', 'price'],
    })

    return res.json({
      id,
      title,
      duration,
      price,
    })
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id)

    if (!plan) {
      return res.status(400).json({ error: "Plan doesn't exists." })
    }

    if (plan.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this plan.",
      })
    }

    await plan.update({ active: false })

    return res.json(plan)
  }
}

export default new PlanController()
