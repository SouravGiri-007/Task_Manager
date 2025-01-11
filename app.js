const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { format, isToday, isTomorrow, isYesterday } = require('date-fns');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Add production logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

// Middleware

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Format date helper function
function formatDueDate(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  return format(dateObj, 'MMM d, yyyy');
}



// Store tasks in memory (in a real app, you'd use a database)


let tasks = [
  { 
    id: 1, 
    title: 'Complete project', 
    status: 'pending', 
    priority: 'high',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),    // Tomorrow
    createdAt: new Date()

  },
  { 
    id: 2, 
    title: 'Buy groceries', 
    status: 'completed', 
    priority: 'medium',
    dueDate: new Date(),  // Today
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)  //  Yesterday

  }

];

// Routes
app.get('/', (req, res) => {
  res.render('index', { tasks: tasks });
});

app.post('/tasks', (req, res) => {

  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    status: 'pending',
    priority: req.body.priority,
    dueDate: req.body.dueDate || null,
    createdAt: new Date()

  };
  tasks.push(newTask);
  res.redirect('/');

});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (task) {

    task.status = task.status === 'pending' ? 'completed' : 'pending';

  }
  res.redirect('/');
});

app.delete('/tasks/:id', (req, res) => {
  
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== taskId);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Task manager app listening at http://localhost:${port}`);
});

module.exports = app;