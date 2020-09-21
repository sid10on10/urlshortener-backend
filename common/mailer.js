const nodemailer = require("nodemailer")

let sendEmail = function(email,subject,payload){
try{
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sid10on10@gmail.com',
      pass: '#'
    }
  });
  
  var mailOptions = {
    from: 'sid10on10@gmail.com',
    to: email,
    subject: subject,
    text: payload
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}catch(error){
    console.log(error)
}
}


//sendEmail("siddhantk.singh.phe14@itbhu.ac.in","Lol","This is dummy text")

module.exports = {sendEmail}