const mongoose = require('mongoose');

const dbConnection = () => {
    mongoose.connect(process.env.DB_URI)
.then(() => console.log(`Mongo DB Connected`))
}


module.exports = dbConnection