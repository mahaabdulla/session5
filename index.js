const express = require('express');
const morgan = require('morgan');
const port = 3000;
const app = express();

const coursesRouter = require('./routes/courses.routes');

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/courses', coursesRouter);



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

