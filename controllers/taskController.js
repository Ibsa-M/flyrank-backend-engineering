// const taskRepository = require("../repositories/taskRepository");

// const getAllTasks = (req, res) => {
//   const tasks = taskRepository.getAllTasks();

//   res.status(200).json(tasks);
// };

// const getTaskById = (req, res) => {
//   const task = taskRepository.getTaskById(req.params.id);

//   if (!task) {
//     return res.status(404).json({
//       error: "Task not found",
//     });
//   }

//   res.status(200).json(task);
// };

// const createTask = (req, res) => {
//   const { title } = req.body;

//   if (!title || title.trim() === "") {
//     return res.status(400).json({
//       error: "Title is required",
//     });
//   }

//   const task = taskRepository.createTask(title);

//   res.status(201).json(task);
// };

// const updateTask = (req, res) => {
//   const { title, completed } = req.body;

//   if (!title || typeof completed !== "boolean") {
//     return res.status(400).json({
//       error: "Title and completed are required",
//     });
//   }

//   const task = taskRepository.updateTask(
//     req.params.id,
//     title,
//     completed
//   );

//   if (!task) {
//     return res.status(404).json({
//       error: "Task not found",
//     });
//   }

//   res.status(200).json(task);
// };

// const deleteTask = (req, res) => {
//   const deleted = taskRepository.deleteTask(req.params.id);

//   if (!deleted) {
//     return res.status(404).json({
//       error: "Task not found",
//     });
//   }

//   res.status(200).json({
//     message: "Task deleted successfully",
//   });
// };

// module.exports = {
//   getAllTasks,
//   getTaskById,
//   createTask,
//   updateTask,
//   deleteTask,
// };













const taskRepository = require("../repositories/taskRepository");

const getAllTasks = async (req, res) => {
  const tasks = await taskRepository.getAllTasks();

  res.status(200).json(tasks);
};

const getTaskById = async (req, res) => {
  const task = await taskRepository.getTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.status(200).json(task);
};

const createTask = async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  const task = await taskRepository.createTask(title);

  res.status(201).json(task);
};

const updateTask = async (req, res) => {
  const { title, completed } = req.body;

  if (!title || typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Title and completed are required",
    });
  }

  const task = await taskRepository.updateTask(
    req.params.id,
    title,
    completed
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.status(200).json(task);
};

const deleteTask = async (req, res) => {
  const deleted = await taskRepository.deleteTask(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.status(200).json({
    message: "Task deleted successfully",
  });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};