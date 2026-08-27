const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const port = 3000;
const app = express();
const url = 'mongodb+srv://mahaabdulla87_db_user:maha1818@cluster0.06rtif0.mongodb.net/codeZone?retryWrites=true&w=majority';


mongoose.connect(url).then(()=> {
    console.log('***** connect Successfully****');

}).catch((error) => {
        console.log('❌ db Error', error);
    });

const coursesRouter = require('./routes/courses.routes');

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/courses', coursesRouter);



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

