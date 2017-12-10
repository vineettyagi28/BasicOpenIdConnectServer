const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Provider = require('oidc-provider');
const Account = require('./accounts/account');
const userRoutes = require('./routes/users');
const MongoAdapter = require('./adapters/mongo')

const app = express();

const clients = [
    {
        client_id: 'kryptoin',
        redirect_uris: ['https://google.com'],
        response_types: ['id_token token'],
        grant_types: ['implicit'],
        token_endpoint_auth_method: 'none',
    }
];

const oidc = new Provider('http://localhost:9000/op', {
    findById: Account.findById,
    claims: {
        // scope: [claims] format
        openid: ['sub'],
        email: ['email', 'email_verified'],
    },
    features: {
    devInteractions: false, // defaults to true
        // discovery: true, // defaults to true
        // requestUri: true, // defaults to true
        // oauthNativeApps: true, // defaults to true
        // pkce: true, // defaults to true

        backchannelLogout: true, // defaults to false
        claimsParameter: true, // defaults to false
        encryption: true, // defaults to false
        introspection: true, // defaults to false
        registration: true, // defaults to false
        request: true, // defaults to false
        revocation: true, // defaults to false
        sessionManagement: true, // defaults to false
    },
    interactionUrl(ctx) {
        return `/interaction/${ctx.oidc.uuid}`;
    }
});

oidc.initialize({adapter: MongoAdapter, clients }).then(() => {
    oidc.app.proxy = true
}).then(function () {

    app.set('trust proxy', true);
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, 'views'));

    const parse = bodyParser.urlencoded({ extended: false });

    app.get('/interaction/:grant', async (req, res) => {
        oidc.interactionDetails(req).then((details) => {
            console.log('see what else is available to you for interaction views', details);

            const view = (() => {
                switch (details.interaction.reason) {
                    case 'consent_prompt':
                    case 'client_not_authorized':
                        return 'interaction';
                    default:
                        return 'login';
                }
            })();

            res.render(view, { details });
        });
    });

    app.post('/interaction/:grant/confirm', parse, (req, res) => {
        oidc.interactionFinished(req, res, {
            consent: {},
        });
    });

    app.post('/interaction/:grant/login', parse, async (req, res, next) => {

        try {
            const account = await Account.authenticate(req.body.email, req.body.password);
            console.log("Account : " + JSON.stringify(account))
            oidc.interactionFinished(req, res, {
                login: {
                    account: account.accountId,
                    acr: '1',
                    remember: !!req.body.remember,
                    ts: Math.floor(Date.now() / 1000),
                },
                consent: {
                    // TODO: remove offline_access from scopes if remember is not checked
                },
            });
        }catch(err){
            console.log(err)
            next();
        }

    });
    app.use('/users', userRoutes);
    app.use('/op', oidc.callback);
    app.listen(9000);
});
