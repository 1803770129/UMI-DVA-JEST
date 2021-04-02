/**
 * npm run build
 * 拷贝文件dist_build文件夹到dist,增量更新资源文件
 */

const copy = require('recursive-copy');

copy('dist_build', 'dist', {overwrite: true}).then(function (results) {
    console.info(`Copied [dist_build] => [dist], ${results.length}`);
})
    .catch(function (error) {
        console.error('Copy failed: ' + error);
    });

