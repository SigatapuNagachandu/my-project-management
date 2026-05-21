const express = require('express');
const router = express.Router();
const protect = require('../authMiddleware');
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
} = require('../controllers/taskController');

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:sid', toggleSubtask);
router.delete('/:id/subtasks/:sid', deleteSubtask);

module.exports = router;
