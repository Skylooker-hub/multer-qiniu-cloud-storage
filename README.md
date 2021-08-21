# multer-qiniu-cloud-storage

multer-qiniu-cloud-storage is a multer custom store engine for Qiniu Cloud Storage service.
multer-qiniu-cloud-storage 用于自定义七牛云对象存储的 multer storage 配置。

# Installation

> npm i multer-qiniu-cloud-storage -S

or

> yarn add multer-qiniu-cloud-storage

# Usage

In Nest

```javascript
import qiniuStorage from 'multer-qiniu-cloud-storage';

@UseInterceptors(
    FileInterceptor('file', {
      storage: new qiniuStorage({
        destination: function (req, file, cb) {
          cb(null, '');
        },// optional
        filename: function (req, file, cb) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },// optional
        ACCESS_KEY: '<Your ACCESS_KEY>',
        SECRET_KEY: '<You SECRET_KEY>',
        bucket: '<You bucket>',
      }),
    }),
  )
  uploadFile(@UploadedFile() file) {
    console.log(file)
  }
```

In Express

```javascript
import * as multer from 'multer';
import * as express from 'express';
import qiniuStorage from 'multer-qiniu-cloud-storage';

const app = express();

const uploadHandler = multer({
  storage: new qiniuStorage({
    destination: function (req, file, cb) {
      cb(null, '');
    },// optional
    filename: function (req, file, cb) {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    },// optional
    ACCESS_KEY: '<Your ACCESS_KEY>',
    SECRET_KEY: '<You SECRET_KEY>',
    bucket: '<You bucket>',
  }),
});

app.post('/upload', uploadHandler.any(), (req, res) => {
    console.log(req.files);
    res.json(req.files);
});
```

# MulterQiniuCloudStorageOptions

| Key            | Description                                                  | required |
| -------------- | ------------------------------------------------------------ | -------- |
| ACCESS_KEY     | qiniu Cloud ACCESS_KEY 七牛云ACCESS_KEY                      | Yes      |
| SECRET_KEY     | qiniu Cloud SECRET_KEY 七牛云SECRET_KEY                      | Yes      |
| bucket         | qiniu Cloud bucket name 七牛云存储空间名                     | Yes      |
| getUploadToken | custom token [获取自定义凭证](https://developer.qiniu.com/kodo/sdk/nodejs#upload-token) | No       |
| destination    | The pseudo-folder to which the file has been saved 保存文件的文件夹 | No       |
| filename       | The name of the file on Qiniu Cloud Storage 保存时文件名     | No       |
| config         | Config options for Qiniu Cloud Storage 七牛云上传用的`config`对象 | No       |
| expires        | token expire time （default 1 hour）凭证的有效时间（默认有效期为1个小时） | No       |
