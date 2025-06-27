const mongoose = require('mongoose')
const env = process.env

mongoose.connection.on('connected', () => console.log('connected'))
mongoose.connection.on('open', () => console.log('open'))
mongoose.connection.on('disconnected', () => console.log('disconnected'))
mongoose.connection.on('reconnected', () => console.log('reconnected'))
mongoose.connection.on('disconnecting', () => console.log('disconnecting'))
mongoose.connection.on('close', () => console.log('close'))

const connectDB = async () => {
console.log(env.DB_URL)
    if(env.MODE == "DEV"){
	try{
	   await mongoose.connect(env.DB_URL)
    	} catch (error) {
           console.log(error)
	}
    }
    if(env.MODE == "PROD"){
    	try {
        	await mongoose.connect(env.DB_URL, {
            	tlsCAFile: `${__dirname}/global-bundle.pem` //Specify the DocDB; cert
        	})
    	} catch (error) {
		console.log(error)
	}
    }
}

const closeDB = async () => {
    await mongoose.connection.close()
}

module.exports = {
    connectDB,
    closeDB
}
