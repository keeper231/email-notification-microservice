const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
// const cors = require('cors');

// Initialize the app
const app = express();
app.use(bodyParser.json());
// app.use(cors());

// Email Transporter Configuration (using a Gmail account for)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'keeper.rem@gmail.com', // Your email
        pass: 'dshr drsa wykn rfjf', // Your email password or app-specific password
    },
});

// Email sending emeregency patient notification
const sendEmailNotification = async (patientData) => {
    const mailOptions = {
        from: 'keeper.rem@gmail.com', // Sender address
        to: 'jrrllrey17@gmail.com', // Recipient email
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

// Route to send OTP email
app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    const mailOptions = {
        from: 'keeper.rem@gmail.com',
        to: email,
        subject: 'Your OTP for Password Reset',
        text: `Your OTP for resetting your password is: ${otp}. This expires in 30 minutes.`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent: ' + info.response);
        res.status(200).json({ message: 'OTP email sent successfully.' });
    } catch (error) {
        console.error('Error sending OTP email: ', error);
        res.status(500).json({ error: 'Failed to send OTP email.' });
    }
});

app.get('/test-route', (req, res) => {
    console.log('The /test-route endpoint is working!');
    res.status(200).json({ message: 'This route is working perfectly!' });
});

// Dataset of FMS Notifications messages with placeholders
const fmsNotificationDataset = [
    { subject: "Approved Invoice", message: "Finance Manager have approved the invoice no: ..." },
    { subject: "Rejected Invoice", message: "Finance Manager have rejected the invoice no: ..." },
    { subject: "Approved Insurance Claim", message: "The ... Insurance Claim have been approved by the Finance Manager" },
    { subject: "Rejected Insurance Claim", message: "The ... Insurance Claim have been rejected by the Finance Manager" },
    { subject: "Added New Employee", message: "A new employee has been added: ..." },
    { subject: "Added New Employees", message: "Bulk upload of employees has been added" },
    { subject: "Added New Department and Services", message: "New Department: ... and its Services has been added" },
    { subject: "Added New Service", message: "New Service has been added ..." },
    { subject: "Succesful Account Retrieval", message: "An FMS Account has been Unlocked: ..." },
    { subject: "Unsuccesful Account Retrieval", message: "An FMS Account was tried to unlocked its account: ..." },
    { subject: "New User Created", message: "A New User Account has been created: ..." },
    { subject: "New User Account Creation Unsuccessful", message: "Failed at creating a new user account: ..." },
    { subject: "Added New Ward", message: "A new ward has been added: ..." },
    { subject: "Added New Room", message: "A new room has been added under the ... ward" },
    { subject: "Added New Bed", message: "A new bed has been added under the ... room" },
    { subject: "Updated Employment Status", message: "The employment status of ... has been updated" },
    { subject: "Employee Soft Delete", message: "The employee ... has been soft deleted" },
    { subject: "Bed Occupied", message: "The bed ... has been occupied by a patient" },
    { subject: "Updated Department and Services Data", message: "The department: ... and its services data has been updated" },
    { subject: "Final Invoice Submitted", message: "The final invoice: .. has been submitted" },
    { subject: "Invoice has been Voided", message: "The invoice: ... has been voided" },
    { subject: "Successful Payment Process", message: "The payment for the invoice: ... has been paid ..." }
];

// Function that replaces placeholders in the message with the actual data
function replacePlaceholders(message, data) {
    return message.replace(/\.\.\./g, data);
}

// API Route for making the notifications 
app.post('/api/notification', (req, res) => {
    try {
        const notifications = [];
        const { Subject: subject, Data: data_2 } = req.body;

        let message = null;

        for (const notif of fmsNotificationDataset) {
            if (notif.subject === subject) { //checks if the subject has an equivalent subject in the dataset
                message = replacePlaceholders(notif.message, data_2);
                break;
            }
        }

        if (!message) {
            return res.status(404).json({ error: `Subject "${subject}" not found in the dataset` });
        }

        const notification = {
            Message: message
        };
        notifications.push(notification);

        return res.status(201).json({ success: 'Notification created', notification });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});