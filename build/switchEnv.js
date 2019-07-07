const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2); // 获取参数

// 获取环境id
let env = '';
switch (argv[0]) {
  case 'dev':
    env = 'develop-zcve4';
    break;
  case 'pub':
  default:
    env = 'sign-up-652910';
}

// 切换环境（以文件为单位）
const switchFile2Env = filePath => {
  fs.writeFileSync(filePath, fs.readFileSync(filePath, 'utf8').replace(/(cloud\.init\({\s*env:\s*')[^\']*(')/g, `$1${env}$2`));
};

// 切换环境（以目录为单位）
const switchDir2Env = dirPath => {
  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      switchDir2Env(filePath);
    } else if (stats.isFile()) {
      switchFile2Env(filePath);
    }
  });
};

// 切换app.js
switchFile2Env(path.join(__dirname, '../miniprogram/app.js'));

// 切换云函数目录
switchDir2Env(path.join(__dirname, '../cloudfunctions'));