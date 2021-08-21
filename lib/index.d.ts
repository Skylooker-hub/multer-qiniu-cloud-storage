import * as qiniu from 'qiniu';
import multer = require('multer');
export declare type MulterQiniuCloudStorageOptions = {
    ACCESS_KEY: string;
    SECRET_KEY: string;
    bucket: string;
    getUploadToken?: () => string;
    destination?: any;
    filename?: any;
    config?: qiniu.conf.ConfigOptions;
    expires?: number;
};
export default class MulterQiniuCloudStorage implements multer.StorageEngine {
    private bucket;
    private accessKey;
    private secretKey;
    private mac;
    private putPolicy;
    private token;
    private expires;
    private getTokenTime;
    private getUploadToken;
    private config;
    private destination;
    private filename;
    getFilename(req: any, file: any, cb: any): void;
    getDestination(req: any, file: any, cb: any): void;
    getContentType(req: any, file: any): any;
    getToken(): string;
    uploadFile(key: any, body: any, callback: any): void;
    deleteFile(obj: any, callback: any): void;
    constructor(opts: MulterQiniuCloudStorageOptions);
    _handleFile: (req: any, file: any, cb: any) => void;
    _removeFile: (req: any, file: any, cb: any) => void;
}
