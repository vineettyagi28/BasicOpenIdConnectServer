const Provider = require('oidc-provider');
const express = require('express');

const app = express();

const clients = [{
    client_id: 'kryptoin',
    client_secret: 'password',
    redirect_uris: ['http://localhost:3000/auth'],
    token_endpoint_auth_method: 'client_secret_post'
    // + other client properties
}];

const oidc = new Provider('http://localhost:9000/op', {
    async findById(ctx, id) {
        return {
            accountId: id,
            async claims() { return { sub: id }; },
        };
    }
});

oidc.initialize({ clients }).then(function () {
    app.use('/op', oidc.callback);
    app.listen(9000);
});
