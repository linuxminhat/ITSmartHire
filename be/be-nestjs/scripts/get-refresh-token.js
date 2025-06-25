const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

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
    const code = '4/0AVMBsJhjzaNYc9sAFBJFq1WMvn1ccRze30vnAzNW8WWDOAI9EFDtTS4GDwI8duSP8T70Pg';
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('\n💾 Refresh Token:');
    console.log(tokens.refresh_token);
}

main().catch(console.error);
