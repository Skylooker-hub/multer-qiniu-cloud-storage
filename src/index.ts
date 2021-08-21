import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as qiniu from 'qiniu';
import multer = require('multer');

export type MulterQiniuCloudStorageOptions = {
  ACCESS_KEY: string;
  SECRET_KEY: string;
  bucket: string;
  getUploadToken?: () => string; // 自定义token获取方式
  destination?: any;
  filename?: any;
  config?: qiniu.conf.ConfigOptions;
  expires?: number;
};

export default class MulterQiniuCloudStorage implements multer.StorageEngine {
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private mac: qiniu.auth.digest.Mac;
  private putPolicy: qiniu.rs.PutPolicy;
  private token: string;
  private expires: number;
  private getTokenTime: number;
  private getUploadToken: () => string;
  private config: qiniu.conf.ConfigOptions;
  private destination;
  private filename;

  getFilename(req, file, cb) {
    if (typeof file.originalname === 'string') cb(null, file.originalname);
    else cb(null, `${uuid()}`);
  }

  getDestination(req, file, cb) {
    cb(null, '');
  }

  getContentType(req, file) {
    if (typeof file.mimetype === 'string') return file.mimetype;
    else return undefined;
  }

  getToken() {
    this.getTokenTime = new Date().getTime() / 1000;
    let token: string;
    if (this.getUploadToken) {
      token = this.getUploadToken();
    } else {
      token = this.putPolicy.uploadToken(this.mac);
    }
    return token;
  }

  uploadFile(key, body, callback) {
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();
    const readableStream = body; // 可读的流
    formUploader.putStream(
      this.token,
      key,
      readableStream,
      putExtra,
      function (respErr, respBody, respInfo) {
        callback(respErr, respBody);
      },
    );
  }
  deleteFile(obj, callback) {
    const bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    bucketManager.delete(obj.Bucket, obj.Key, callback);
  }

  constructor(opts: MulterQiniuCloudStorageOptions) {
    this.accessKey = opts.ACCESS_KEY;
    this.secretKey = opts.SECRET_KEY;
    this.bucket = opts.bucket;
    this.expires = opts.expires || 3600
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

  _handleFile = (req, file, cb) => {
    // auto fresh token 自动刷新token
    let currentTime = new Date().getTime() / 1000;
    if (currentTime - this.getTokenTime >= 3600) {
      this.token = this.getToken();
    }
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    this.destination(req, file, (err, destination) => {
      if (err) {
        return cb(err);
      }
      this.filename(req, file, (err, filename) => {
        if (err) {
          return cb(err);
        }

        let finalPath = path.join(destination, filename),
          Key = finalPath,
          Body = file.stream;

        this.uploadFile(Key, Body, function (err, data) {
          if (err) {
            cb(err, data);
          } else {
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
  _removeFile = (req, file, cb) => {
    this.deleteFile(
      {
        Bucket: this.bucket,
        Key: file.path,
      },
      cb,
    );
  };
}
