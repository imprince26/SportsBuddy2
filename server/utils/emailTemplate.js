const AdminSentEmailHtml = ({ subject, message, buttonText, buttonUrl }) => {
    const primaryColor = '#3b82f6'; // primary.dark from your theme
    const backgroundColor = '#f9fafb'; // background.light
    const textColor = '#111827'; // foreground.light
    const cardColor = '#ffffff'; // card.light
    const footerTextColor = '#6b7280'; // muted.foreground.light

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${subject}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            background-color: ${backgroundColor};
            font-family: 'Poppins', Arial, sans-serif;
        }
        table {
            border-spacing: 0;
        }
        td {
            padding: 0;
        }
        img {
            border: 0;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: ${backgroundColor};
            padding-bottom: 60px;
        }
        .main {
            background-color: ${cardColor};
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Poppins', Arial, sans-serif;
            color: ${textColor};
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .content {
            padding: 32px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
            margin-top: 0;
            margin-bottom: 20px;
            color: ${textColor};
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 24px;
        }
        .button {
            background-color: ${primaryColor};
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
            font-size: 16px;
        }
        .footer {
            font-size: 12px;
            color: ${footerTextColor};
            text-align: center;
            padding-top: 20px;
        }
        .footer a {
            color: ${footerTextColor};
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <!-- Header -->
            <tr>
                <td style="padding: 24px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="text-decoration: none; color: ${primaryColor}; font-size: 28px; font-weight: 700;">
                        SportsBuddy
                    </a>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content">
                    <h1>${subject}</h1>
                    <p>${message}</p>
                    ${buttonText && buttonUrl ? `
                    <a href="${buttonUrl}" target="_blank" class="button">
                        ${buttonText}
                    </a>
                    ` : ''}
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 32px;">
                    <div class="footer">
                        <p>
                            You received this email because you are a member of SportsBuddy.
                        </p>
                        <p>
                            &copy; ${new Date().getFullYear()} SportsBuddy. All rights reserved.
                        </p>
                        <p>
                            123 SportBuddy, Ahmedabad, Gujarat, India
                        </p>
                        <p>
                            <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
  `;
};

const welcomeEmailHtml = (name) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SportsBuddy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #3b82f6; /* primary.dark */
        }
        p {
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to SportsBuddy, ${name}!</h1>
        <p>Thank you for joining our community of sports enthusiasts. We are excited to have you on board!</p>
        <p>At SportsBuddy, we believe in connecting people through sports and activities. Whether you're looking for a partner to play with or want to join local events, we've got you covered.</p>
        <p>Feel free to explore our platform and start making new connections today!</p>
        <p>Best regards,<br>The SportsBuddy Team</p>
    </div>
</body>
</html>
    `;
}

const resetPasswordEmailHtml = ({ name, resetCode }) => {
    const primaryColor = '#3b82f6';
    const backgroundColor = '#f9fafb';
    const textColor = '#111827';
    const cardColor = '#ffffff';
    const footerTextColor = '#6b7280';
    const codeBackgroundColor = '#f3f4f6';
    const codeBorderColor = '#d1d5db';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Reset Your Password - SportsBuddy</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            background-color: ${backgroundColor};
            font-family: 'Poppins', Arial, sans-serif;
        }
        table {
            border-spacing: 0;
        }
        td {
            padding: 0;
        }
        img {
            border: 0;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: ${backgroundColor};
            padding-bottom: 60px;
        }
        .main {
            background-color: ${cardColor};
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Poppins', Arial, sans-serif;
            color: ${textColor};
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .content {
            padding: 40px 32px;
        }
        .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, #1e40af 100%);
            color: white;
            text-align: center;
            padding: 30px 32px;
            border-radius: 12px 12px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        h2 {
            font-size: 24px;
            font-weight: 600;
            line-height: 1.3;
            margin-top: 0;
            margin-bottom: 16px;
            color: ${textColor};
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 24px;
            color: ${textColor};
        }
        .code-container {
            background-color: ${codeBackgroundColor};
            border: 2px dashed ${codeBorderColor};
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
        }
        .code {
            font-size: 36px;
            font-weight: 700;
            color: ${primaryColor};
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .code-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 8px;
            font-weight: 500;
        }
        .warning-box {
            background-color: #fef3cd;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .security-tips {
            background-color: #f0f9ff;
            border-left: 4px solid ${primaryColor};
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .security-tips h3 {
            margin: 0 0 12px 0;
            color: ${primaryColor};
            font-size: 18px;
            font-weight: 600;
        }
        .security-tips ul {
            margin: 0;
            padding-left: 20px;
        }
        .security-tips li {
            margin-bottom: 8px;
            color: #1e40af;
            font-size: 14px;
        }
        .footer {
            font-size: 12px;
            color: ${footerTextColor};
            text-align: center;
            padding: 32px;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: ${footerTextColor};
            text-decoration: underline;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: white;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .main {
                width: 100% !important;
                margin: 0 !important;
                border-radius: 0 !important;
            }
            .content {
                padding: 24px 20px !important;
            }
            .header {
                padding: 24px 20px !important;
                border-radius: 0 !important;
            }
            .code {
                font-size: 28px !important;
                letter-spacing: 4px !important;
            }
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <!-- Header -->
            <tr>
                <td class="header">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="logo">
                        🏆 SportsBuddy
                    </a>
                    <h1>Password Reset Request</h1>
                    <p>We received a request to reset your password</p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content">
                    <h2>Hello ${name}!</h2>
                    <p>
                        We received a request to reset your password for your SportsBuddy account. 
                        To proceed with the password reset, please use the verification code below:
                    </p>

                    <div class="code-container">
                        <div class="code">${resetCode}</div>
                        <div class="code-label">Verification Code</div>
                    </div>

                    <div class="warning-box">
                        <p>
                            <strong>⚠️ Important:</strong> This code will expire in 10 minutes. 
                            If you didn't request this password reset, please ignore this email.
                        </p>
                    </div>

                    <p>
                        Enter this code in the password reset form to continue. After verification, 
                        you'll be able to create a new password for your account.
                    </p>

                    <div class="security-tips">
                        <h3>🔒 Security Tips</h3>
                        <ul>
                            <li>Never share your verification code with anyone</li>
                            <li>SportsBuddy will never ask for your password via email</li>
                            <li>Create a strong password with letters, numbers, and symbols</li>
                            <li>Use a unique password that you don't use elsewhere</li>
                        </ul>
                    </div>

                    <p>
                        If you're having trouble with the password reset process, please contact our 
                        support team at <a href="mailto:support@sportsbuddy.com">support@sportsbuddy.com</a>.
                    </p>

                    <p>
                        Thanks for being part of the SportsBuddy community!<br>
                        <strong>The SportsBuddy Team</strong>
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p>
                        You received this email because a password reset was requested for your SportsBuddy account.
                    </p>
                    <p>
                        &copy; ${new Date().getFullYear()} SportsBuddy. All rights reserved.
                    </p>
                    <p>
                        123 SportBuddy, Ahmedabad, Gujarat, India
                    </p>
                    <p>
                        <a href="${process.env.CLIENT_URL}/privacy">Privacy Policy</a> | 
                        <a href="${process.env.CLIENT_URL}/terms">Terms of Service</a>
                    </p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;
};

const passwordResetSuccessEmailHtml = ({ name }) => {
    const primaryColor = '#10b981'; // green
    const backgroundColor = '#f9fafb';
    const textColor = '#111827';
    const cardColor = '#ffffff';
    const footerTextColor = '#6b7280';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - SportsBuddy</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body {
            margin: 0;
            padding: 0;
            background-color: ${backgroundColor};
            font-family: 'Poppins', Arial, sans-serif;
        }
        .main {
            background-color: ${cardColor};
            margin: 40px auto;
            width: 100%;
            max-width: 600px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, #059669 100%);
            color: white;
            text-align: center;
            padding: 30px 32px;
            border-radius: 12px 12px 0 0;
        }
        .content {
            padding: 40px 32px;
            color: ${textColor};
        }
        .success-icon {
            width: 80px;
            height: 80px;
            background-color: ${primaryColor};
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        h2 {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .button {
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: ${footerTextColor};
            text-align: center;
            padding: 32px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>Password Reset Successful!</h1>
        </div>
        <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your password has been successfully reset. You can now log in to your SportsBuddy account with your new password.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <a href="${process.env.CLIENT_URL}/login" class="button">Sign In to SportsBuddy</a>
            <p>Thanks for being part of the SportsBuddy community!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SportsBuddy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};


export { AdminSentEmailHtml, welcomeEmailHtml, resetPasswordEmailHtml, passwordResetSuccessEmailHtml };