"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var path = require("path");
var qiniu = require("qiniu");
var MulterQiniuCloudStorage = /** @class */ (function () {
    function MulterQiniuCloudStorage(opts) {
        var _this = this;
        this._handleFile = function (req, file, cb) {
            // auto fresh token 自动刷新token
            var currentTime = new Date().getTime() / 1000;
            if (currentTime - _this.getTokenTime >= 3600) {
                _this.token = _this.getToken();
            }
            var formUploader = new qiniu.form_up.FormUploader(_this.config);
            _this.destination(req, file, function (err, destination) {
                if (err) {
                    return cb(err);
                }
                _this.filename(req, file, function (err, filename) {
                    if (err) {
                        return cb(err);
                    }
                    var finalPath = path.join(destination, filename), Key = finalPath, Body = file.stream;
                    _this.uploadFile(Key, Body, function (err, data) {
                        if (err) {
                            cb(err, data);
                        }
                        else {
                            cb(null, {
                                destination: destination,
                                filename: filename,
                                path: finalPath,
                            });
                        }
                    });
                });
            });
        };
        this._removeFile = function (req, file, cb) {
            _this.deleteFile({
                Bucket: _this.bucket,
                Key: file.path,
            }, cb);
        };
        this.accessKey = opts.ACCESS_KEY;
        this.secretKey = opts.SECRET_KEY;
        this.bucket = opts.bucket;
        this.expires = opts.expires || 3600;
        this.mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
        this.putPolicy = new qiniu.rs.PutPolicy({
            scope: this.bucket,
            expires: this.expires,
        });
        this.getUploadToken = opts.getUploadToken;
        this.config = opts.config || {};
        this.token = this.getToken();
        this.destination = opts.destination || this.getDestination;
        this.filename = opts.filename || this.getFilename;
    }
    MulterQiniuCloudStorage.prototype.getFilename = function (req, file, cb) {
        if (typeof file.originalname === 'string')
            cb(null, file.originalname);
        else
            cb(null, "" + uuid_1.v4());
    };
    MulterQiniuCloudStorage.prototype.getDestination = function (req, file, cb) {
        cb(null, '');
    };
    MulterQiniuCloudStorage.prototype.getContentType = function (req, file) {
        if (typeof file.mimetype === 'string')
            return file.mimetype;
        else
            return undefined;
    };
    MulterQiniuCloudStorage.prototype.getToken = function () {
        this.getTokenTime = new Date().getTime() / 1000;
        var token;
        if (this.getUploadToken) {
            token = this.getUploadToken();
        }
        else {
            token = this.putPolicy.uploadToken(this.mac);
        }
        return token;
    };
    MulterQiniuCloudStorage.prototype.uploadFile = function (key, body, callback) {
        var formUploader = new qiniu.form_up.FormUploader(this.config);
        var putExtra = new qiniu.form_up.PutExtra();
        var readableStream = body; // 可读的流
        formUploader.putStream(this.token, key, readableStream, putExtra, function (respErr, respBody, respInfo) {
            callback(respErr, respBody);
        });
    };
    MulterQiniuCloudStorage.prototype.deleteFile = function (obj, callback) {
        var bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
        bucketManager.delete(obj.Bucket, obj.Key, callback);
    };
    return MulterQiniuCloudStorage;
}());
exports.default = MulterQiniuCloudStorage;
//# sourceMappingURL=index.js.map