const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Subtask title is required'],
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        project: {
            type: String,
            default: 'Inbox',
            trim: true,
        },
        dueDate: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subtasks: [subtaskSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
