"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var User = /** @class */ (function () {
    //construct a new user bref decla quoi 
    function User(username, email, password, passwordHashed) {
        if (passwordHashed === void 0) { passwordHashed = false; }
        this.password = "";
        this.username = username;
        this.email = email;
        this.password = password;
        if (!passwordHashed) {
            this.setPassword(password);
        }
        else
            this.password = password;
    }
    //New User
    User.fromDb = function (username, value) {
        var _a = value.split(":"), password = _a[0], email = _a[1];
        return new User(username, email, password);
    };
    //function to set password
    User.prototype.setPassword = function (toSet) {
        // Hash and set password
        this.password = toSet;
    };
    //function to get password
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.validatePassword = function (toValidate) {
        if (this.getPassword() === toValidate) {
            return true;
        }
        else {
            return false;
        }
    };
    return User;
}());
exports.User = User;
var UserHandler = /** @class */ (function () {
    function UserHandler(path) {
        this.db = leveldb_1.LevelDB.open(path);
    }
    UserHandler.prototype.get = function (username, callback) {
        this.db.get("user:" + username, function (err, data) {
            if (err)
                callback(err);
            else if (data === undefined)
                callback(null, data);
            callback(null, User.fromDb(username, data));
        });
    };
    UserHandler.prototype.save = function (user, callback) {
        //first we have the key then we have the value 
        this.db.put("user:" + user.username, user.getPassword + ":" + user.email, function (err) {
            callback(err);
        });
    };
    UserHandler.prototype.delete = function (username, callback) {
        var key = "user:" + username;
        this.db.del(key, function (err) {
            callback(err);
        });
    };
    return UserHandler;
}());
exports.UserHandler = UserHandler;
