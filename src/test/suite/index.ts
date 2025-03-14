import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    
    // 创建mocha测试
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((resolve, reject) => {
        
        glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return reject(err);
            }

            // 添加文件到测试套件
            files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                // 运行mocha测试
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} 个测试失败`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    });
}
