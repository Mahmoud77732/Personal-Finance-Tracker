/*
account: sign-in -> Github 
        Mahmoud77732@github.oktaidp
        dev-93031972.okta.com
        mails-go-to: mm8871918@gmail.com
*/


export default {

    // info from https://dev-93031972-admin.okta.com/
    oidc: {
        clientId: '0oanwzu1vlUJW6DID5d7', //public identifier
        issuer: 'https://dev-93031972.okta.com/oauth2/default', //authorization server on okta: issuer of tokens
        redirectUri: 'http://localhost:4200/login/callback', //once user logs in, send them here
        scopes: ['openid', 'profile', 'email'], //openid: authentication requests, profile: users's info, email: user's email
        pkce: true,
        useInteractionCodeFlow: false // Explicitly disable OIE
    }

}

// http://localhost:4200/implicit/callback
// http://localhost:4200/login/callback
