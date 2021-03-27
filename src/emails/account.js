const sgMail = require('@sendgrid/mail')

//const sendgridAPIKey //this should never be hardcoded in also need to verify sender do not have key
const sender = 'sean.m.devoy@gmail.com'
//sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'sean.m.devoy@gmail.com',
        subject: 'Thanks for signing up!',
        text: `Welcome ${name}`
    })
}

const sendCancelEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from: sender,
        subject: 'You will be missed',
        text: `${name}, we are sorry to see you go `
    })
}

module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendCancelEmail: sendCancelEmail
}