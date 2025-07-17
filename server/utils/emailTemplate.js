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


export { AdminSentEmailHtml, welcomeEmailHtml };