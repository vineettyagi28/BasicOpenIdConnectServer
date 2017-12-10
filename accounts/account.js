'use strict';

const assert = require('assert');
const _ = require('lodash');
const User = require('../models/user');
const DB = require('../database/config');

class Account {
    constructor(id) {
        this.accountId = id; // the property named accountId is important to oidc-provider
    }

    // claims() should return or resolve with an object with claims that are mapped 1:1 to
    // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
    async claims() {
        let user = await User.findOne({_id: this.accountId}).exec();
        console.log("User inside account: " + JSON.stringify(user));
        return Object.assign({}, user, {
            sub: this.accountId,
        });
    }

    static async findById(ctx, id) {
        // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
        // one
        return new Account(id);
    }

    static async authenticate(email, password) {
        assert(password, 'password must be provided');
        assert(email, 'email must be provided');
        const lowercased = String(email).toLowerCase();
        const user = await User.findOne({email: email}).exec();
        console.log("User : " + JSON.stringify(user));
        assert.equal(user.password, password, "Password did not match")
        return new this(user._id);
    }
}

module.exports = Account;