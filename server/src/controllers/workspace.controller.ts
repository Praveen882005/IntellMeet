import { Request, Response } from 'express'
import { Workspace } from '../models/Workspace.model'
import { WorkspaceMember } from '../models/WorkspaceMember.model'
import { User } from '../models/User.model'
import { ApiResponse } from '../utils/apiResponse'
import { AppError } from '../utils/appError'
import { db } from '../config/db'

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId
  const orgId = req.body.organizationId || req.user?.organizationId
  const { name, slug, description, isPrivate } = req.body

  if (!orgId) {
    throw AppError.badRequest('Organization ID is required.')
  }

  if (db.isConnected()) {
    const workspace = new Workspace({
      organizationId: orgId,
      name,
      slug,
      description: description || '',
      isPrivate: Boolean(isPrivate),
      defaultRole: 'member',
    })
    const saved = await workspace.save()

    // Add creator as owner
    await WorkspaceMember.create({
      workspaceId: saved._id,
      userId,
      role: 'owner',
    })

    ApiResponse.created(res, saved, 'Workspace created successfully.')
    return
  }

  const mockWs = {
    _id: `ws_${Date.now()}`,
    organizationId: orgId,
    name,
    slug,
    description,
    isPrivate,
    createdAt: new Date(),
  }

  ApiResponse.created(res, mockWs, 'Workspace created successfully.')
}

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
  const orgId = req.query.organizationId || req.user?.organizationId

  if (db.isConnected() && orgId) {
    const list = await Workspace.find({ organizationId: orgId }).lean()
    ApiResponse.success(res, list, 'Workspaces retrieved.')
    return
  }

  ApiResponse.success(
    res,
    [
      { _id: 'ws_general', name: 'General Workspace', slug: 'general', isPrivate: false },
      { _id: 'ws_eng', name: 'Core Engineering', slug: 'core-eng', isPrivate: false },
    ],
    'Workspaces retrieved.'
  )
}

export const getWorkspaceMembers = async (req: Request, res: Response): Promise<void> => {
  const { id: workspaceId } = req.params

  if (db.isConnected()) {
    const members = await WorkspaceMember.find({ workspaceId })
      .populate('userId', 'name email avatarUrl status')
      .lean()
    ApiResponse.success(res, members, 'Workspace members list.')
    return
  }

  ApiResponse.success(
    res,
    [
      { _id: 'mem_1', role: 'owner', userId: { name: 'Sarah Chen', email: 'sarah@company.com', status: 'active' } },
      { _id: 'mem_2', role: 'admin', userId: { name: 'David Miller', email: 'david@company.com', status: 'active' } },
      { _id: 'mem_3', role: 'member', userId: { name: 'Elena Rostova', email: 'elena@company.com', status: 'active' } },
    ],
    'Members retrieved.'
  )
}

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  const { id: workspaceId } = req.params
  const { email, role = 'member' } = req.body

  if (db.isConnected()) {
    // Check if user exists
    let user = await User.findOne({ email })
    if (!user) {
      // Create guest user record
      user = await User.create({
        name: email.split('@')[0],
        email,
        role: 'guest',
        status: 'away',
      })
    }

    const member = await WorkspaceMember.findOneAndUpdate(
      { workspaceId, userId: user._id },
      { role, joinedAt: new Date() },
      { upsert: true, new: true }
    )

    ApiResponse.created(res, member, `Invitation sent to ${email}.`)
    return
  }

  ApiResponse.created(
    res,
    { _id: `mem_${Date.now()}`, workspaceId, email, role, status: 'invited' },
    `Invitation sent to ${email}.`
  )
}

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  const { id: workspaceId, memberId } = req.params
  const { role } = req.body

  if (db.isConnected()) {
    const updated = await WorkspaceMember.findByIdAndUpdate(
      memberId,
      { role },
      { new: true }
    )
    ApiResponse.success(res, updated, 'Member role updated.')
    return
  }

  ApiResponse.success(res, { memberId, role }, 'Member role updated.')
}

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  const { id: workspaceId, memberId } = req.params

  if (db.isConnected()) {
    await WorkspaceMember.findByIdAndDelete(memberId)
  }

  ApiResponse.success(res, { removed: true }, 'Member removed from workspace.')
}
