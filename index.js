const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Initialize the app
const app = express();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

// Email Transporter Configuration (using a Gmail account for example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'keeper.rem@gmail.com', // Your email
        pass: 'dshr drsa wykn rfjf', // Your email password or app-specific password
    },
});

// Email sending function
const sendEmailNotification = async (patientData) => {
    const mailOptions = {
        from: 'keeper.rem@gmail.com', // Sender address
        to: 'leamarielawayan@gmail.com', // Recipient email
        subject: 'Emergency Patient Added', // Subject of the email
        text: `An emergency patient has been added:\n\nPatient Info:\nName: ${patientData.emergency_first_name} ${patientData.emergency_last_name}\nDate of Birth: ${patientData.emergency_age}\nPriority Level: ${patientData.priority_level}`, // Email body
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

// Route to add an emergency patient and send email
app.post('/add-emergency-patient', (req, res) => {
    const patientData = req.body;

    // Simulate saving patient data to the database
    // This is where you'd insert the patient data into your database
    console.log('Patient added:', patientData);

    // Send email notification
    sendEmailNotification(patientData);

    res.status(200).json({ message: 'Patient added and email sent.' });
});

// Route to send email with PDF attachment
app.post('/send-assessment-email', async (req, res) => {
    const { email, pdfFileName, pdfBase64 } = req.body;

    const mailOptions = {
        from: 'keeper.rem@gmail.com',
        to: email,
        subject: 'Emergency Patient Assessment PDF',
        text: 'Please find attached the Emergency Patient Assessment PDF.',
        attachments: [
            {
                filename: pdfFileName || 'Diagnostic_Test_Order.pdf', // Use the provided file name or a default
                content: Buffer.from(pdfBase64, 'base64'), // Convert from base64 to buffer
                contentType: 'application/pdf' // Specify the content type as PDF
            },
        ],
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent successfully.' });
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});