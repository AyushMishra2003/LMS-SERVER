import nodemailer from 'nodemailer'


const sendEmail = async function (email, subject, message) {
    console.log("helo1");
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        service:'gmail',
        // port: 587,
        auth: {
            user: 'ayushm185@gmail.com',
            pass: 'ddozfyrcpqtygozt'
        }
    });
    console.log("helo2");
    await transporter.sendMail({
        from: 'ayushm185@gmail.com', // sender address
        to: "itsakash18.06@gmail.com", // list of receivers
        subject:subject, // Subject line
        // text: "Hello world?", // plain text body
        html:message, // html body
    });
    console.log("hello3");
}
export default sendEmail