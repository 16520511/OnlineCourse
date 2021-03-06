const express = require('express');
const apiRouter = require('./routes/api');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();

//Use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./client/src/static/images'));
//Serve static assets
app.use('/api', apiRouter);
// app.use(fileUpload({
//     limits: { 
// 		fileSize: 1 * 1024 * 1024,
// 		fields: 50,
// 		files: 1,
// 		parts: 51,
// 	}
// }));

if(process.env.NODE_ENV === 'production')
{
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}
//API router

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log('listening on port 8000');
});