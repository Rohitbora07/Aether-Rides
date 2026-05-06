import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AETHER_EMAIL,
        pass: process.env.PASS
    }
})

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        console.log("Sending mail to:", to);
        await transporter.sendMail({
            from: `"AETHER RIDES" <${process.env.AETHER_EMAIL}>`,
            to,
            subject,
            html
        })

    } catch (error) {
        console.error("Error sending email:", error);
    }   
}