import { Request, Response } from 'express'
import { ActionItem } from '../models/ActionItem.model'
import { ApiResponse } from '../utils/apiResponse'
import { db } from '../config/db'

export const getActionItems = async (req: Request, res: Response): Promise<void> => {
  const { meetingId, status } = req.query

  if (db.isConnected()) {
    const filter: any = {}
    if (meetingId) filter.meetingId = meetingId
    if (status) filter.status = status

    const list = await ActionItem.find(filter).sort({ createdAt: -1 }).lean()
    ApiResponse.success(res, list, 'Action items retrieved.')
    return
  }

  ApiResponse.success(
    res,
    [
      { id: 1, text: 'Finalize WebRTC peer connection signaling pipeline', assignee: 'Engineering Team', status: 'completed' },
      { id: 2, text: 'Verify multi-user room broadcasting and chat events', assignee: 'QA Lead', status: 'in_progress' },
      { id: 3, text: 'Deploy Phase 2 UI release', assignee: 'Frontend Architect', status: 'pending' },
    ],
    'Action items retrieved.'
  )
}

export const createActionItem = async (req: Request, res: Response): Promise<void> => {
  const data = req.body

  if (db.isConnected()) {
    const item = await ActionItem.create(data)
    ApiResponse.created(res, item, 'Action item created.')
    return
  }

  ApiResponse.created(res, { ...data, _id: `task_${Date.now()}` }, 'Action item created.')
}

export const updateActionItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const updates = req.body

  if (db.isConnected()) {
    const updated = await ActionItem.findByIdAndUpdate(id, { $set: updates }, { new: true })
    ApiResponse.success(res, updated, 'Action item updated.')
    return
  }

  ApiResponse.success(res, { id, ...updates }, 'Action item updated.')
}
