// scripts/get-refresh-token.js
require('dotenv').config();
const { google } = require('googleapis');

async function main() {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GCAL_CLIENT_ID,
        process.env.GCAL_CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    console.log('1) Mở URL này và cấp quyền:');
    console.log(authUrl);

    // dán code vào biến này rồi chạy lại
    const code = '4/0AUJR-x72l4oTJ-iJrsSVI2mzuFxfO1LWdF4O9pOQNF2txlmBfWj-Sa5bTKxP4mpW_gtFGQ';
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('\n💾 Refresh Token:');
    console.log(tokens.refresh_token);
}

main().catch(console.error);
