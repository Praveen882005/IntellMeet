import React, { useState } from 'react'
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  MoreVertical,
  Calendar,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

export const TasksPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('Sarah Chen')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTaskDue, setNewTaskDue] = useState('Nov 5, 2026')

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Finalize WebRTC STUN/TURN fallback verification',
      meeting: 'Sprint Q4 Review',
      assignee: 'Engineering Team',
      dueDate: 'Today',
      priority: 'high' as const,
      completed: true,
    },
    {
      id: 2,
      title: 'Review SOC-2 audit logging requirements for transcript storage',
      meeting: 'Architecture Sync',
      assignee: 'David Miller',
      dueDate: 'Tomorrow',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: 3,
      title: 'Verify HTML5 Web Speech continuous subtitle auto-restart',
      meeting: 'Client Engine Review',
      assignee: 'Sarah Chen',
      dueDate: 'Nov 2',
      priority: 'high' as const,
      completed: true,
    },
    {
      id: 4,
      title: 'Distribute AI meeting minutes to executive leadership',
      meeting: 'Weekly Standup',
      assignee: 'Elena Rostova',
      dueDate: 'Nov 4',
      priority: 'low' as const,
      completed: false,
    },
    {
      id: 5,
      title: 'Deploy Phase 2 modern enterprise frontend design system',
      meeting: 'UI Architecture Sprint',
      assignee: 'Frontend Architect',
      dueDate: 'Nov 3',
      priority: 'high' as const,
      completed: false,
    },
  ])

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: newTaskTitle.trim(),
          meeting: 'Manual Entry',
          assignee: newTaskAssignee,
          dueDate: newTaskDue,
          priority: newTaskPriority,
          completed: false,
        },
      ])
      setNewTaskTitle('')
      setCreateModalOpen(false)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return !t.completed
    if (filterStatus === 'completed') return t.completed
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAECF0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#101828]">
              Tasks & Action Items
            </h1>
            <Badge variant="primary" size="sm">
              {tasks.filter((t) => !t.completed).length} Pending
            </Badge>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Checkable action items extracted autonomously from collaborative meetings and team workflows.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Action Item
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-[#101828] text-white'
              : 'bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'bg-[#101828] text-white'
              : 'bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]'
          }`}
        >
          Pending ({tasks.filter((t) => !t.completed).length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'completed'
              ? 'bg-[#101828] text-white'
              : 'bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]'
          }`}
        >
          Completed ({tasks.filter((t) => t.completed).length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            hoverable
            className={`p-4 flex items-center justify-between gap-4 transition-all select-none ${
              task.completed ? 'bg-[#F8FAFC] opacity-75' : 'bg-white'
            }`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-start gap-3.5 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}}
                className="mt-0.5 rounded border-[#D0D5DD] text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div className="space-y-1">
                <span
                  className={`text-sm font-medium ${
                    task.completed ? 'line-through text-[#98A2B3]' : 'text-[#101828]'
                  }`}
                >
                  {task.title}
                </span>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                  <span className="text-[#344054] font-medium">Meeting: {task.meeting}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#98A2B3]" /> Assignee:{' '}
                    <span className="text-[#2563EB] font-medium">{task.assignee}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" /> Due: {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Badge
                variant={
                  task.priority === 'high'
                    ? 'error'
                    : task.priority === 'medium'
                    ? 'warning'
                    : 'gray'
                }
                size="sm"
              >
                {task.priority.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Action Item"
        description="Create a discrete to-do task associated with your workspace."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          <Input
            label="Task Description"
            placeholder="e.g. Verify STUN candidate exchange"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Assignee Name"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              required
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-[#344054]">
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-xs text-[#101828] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <Input
            label="Due Date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
            placeholder="e.g. Nov 5, 2026"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Action Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
