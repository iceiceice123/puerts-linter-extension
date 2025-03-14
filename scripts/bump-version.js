const fs = require('fs');
const path = require('path');

// 读取 package.json 文件
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

// 获取当前版本号
const currentVersion = packageJson.version;
console.log(`当前版本: ${currentVersion}`);

// 将版本号拆分为主版本号、次版本号和补丁版本号
const [major, minor, patch] = currentVersion.split('.').map(Number);

// 增加补丁版本号
const newVersion = `${major}.${minor}.${patch + 1}`;
console.log(`新版本: ${newVersion}`);

// 更新 package.json 中的版本号
packageJson.version = newVersion;

// 将更新后的 package.json 写回文件
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`版本号已更新为 ${newVersion}`);
