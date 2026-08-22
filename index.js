const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;

// middleware for logging HTTP requests
app.use(morgan('dev'));
// middleware to parse JSON request bodies 
app.use(express.json());

const courses = [
    { id: 1, title: 'Java Script', price: 100 },
    { id: 2, title: 'html', price: 200 },
    { id: 3, title: 'CSS3', price: 300 },
    { id: 4, title: 'JavaScript', price: 400 },
    { id: 5, title: 'Node.js', price: 500 },
    { id: 6, title: 'React', price: 600 },
    { id: 7, title: 'Vue.js', price: 700 },
    { id: 8, title: 'Angular', price: 800 }
];

app.get('/api/courses', (req, res) => {
    res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
    console.log('===== {req.params} ====', req.params);
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);

});

app.post('/api/courses', (req, res) => {
    const { title, price } = req.body;
    const newCourse = { id: courses.length + 1, title, price };
    if (!title || title.length < 3) {
        return res.status(400).json({ error: 'Title is required and must be at least 3 characters long' });
    }
    if (!price || typeof price !== 'number') {
        return res.status(400).json({ error: 'Price is required and must be a number' });
    }
    courses.push(newCourse);
    res.status(201).json(newCourse);

});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// (CRUD)