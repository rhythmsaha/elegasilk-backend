export const verifyAccount = ({ name, url }: { name: string; url: string }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verify Your Account</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 80%;
                margin: auto;
                overflow: hidden;
            }
            .main-content {
                box-shadow: 0 0 10px 0 rgba(0,0,0,0.1);
                margin: 20px auto;
                background: white;
                padding: 20px;
                text-align: center;
            }
            .button {
                display: inline-block;
                color: white;
                background-color: #3498db;
                border: none;
                padding: 10px 20px;
                text-decoration: none;
                margin: 10px 2px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="main-content">
                <h1>Welcome to Elegasilk</h1>
                <p>Hey ${name}, Thank you for signing up. Please verify your email to activate your account.</p>
                <a href="${url}" class="button">Verify Account</a>
                <p>If you did not sign up for this account, you can ignore this email and the account will remain inactive.</p>
                <p>Best,</p>
                <p>Elegasilk</p>
            </div>
        </div>
    </body>
    </html>`;
};
