const Task = require('../models/Task');

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, project, dueDate } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const task = await Task.create({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            project: project || 'Inbox',
            dueDate: dueDate || null,
            userId: req.user.id,
            subtasks: [],
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create task' });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const allowedFields = ['title', 'description', 'status', 'priority', 'project', 'dueDate', 'completedAt'];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        if (req.body.status && req.body.status !== task.status) {
            if (req.body.status === 'done') {
                task.completedAt = new Date();
            } else {
                task.completedAt = null;
            }
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update task' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete task' });
    }
};

const addSubtask = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Subtask title is required' });

        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.subtasks.push({ title, completed: false });
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add subtask' });
    }
};

const toggleSubtask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const subtask = task.subtasks.id(req.params.sid);
        if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

        subtask.completed = !subtask.completed;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Failed to toggle subtask' });
    }
};

const deleteSubtask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.subtasks = task.subtasks.filter((sub) => sub._id.toString() !== req.params.sid);
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete subtask' });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask };
