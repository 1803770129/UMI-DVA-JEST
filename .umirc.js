import path from 'path';
export default {
    treeShaking: true,
    plugins: [
        // ref: https://umijs.org/plugin/umi-plugin-react.html
        [
            'umi-plugin-react',
            {
                antd: true,
                dva: true,
                dynamicImport: {
                    webpackChunkName: true,
                },
                chunks: process.env.NODE_ENV !== 'production' ? ['umi'] : ['vendors', 'umi', 'commons'],
                // chunks: ['vendors', 'umi', 'commons'],
                // title: '搜配',
                dll: true,
                routes: {
                    exclude: [/models\//, /services\//, /components\//],
                },
                // hardSource: false,
            },
        ],
        ['umi-plugin-pnp', { alias: true }],
    ],

    // plugins: [
    //     [
    //         // ref: https://umijs.org/plugin/umi-plugin-react.html
    //         'umi-plugin-react', {
    //             antd: true,
    //             dva: true,
    //             dynamicImport: { webpackChunkName: true },
    //             chunks: process.env.NODE_ENV !== 'production' ? ['umi'] : ['vendors', 'umi', 'commons'],
    //             // chunks: ['vendors', 'umi', 'commons'],
    //             title: '搜配',
    //             dll: true,
    //             routes: {
    //                 exclude: [
    //                     /models\//,
    //                     /services\//,
    //                     /model\.(t|j)sx?$/,
    //                     /service\.(t|j)sx?$/,
    //                     /components\//,
    //                 ],
    //             },
    //             // hardSource: false,
    //         },
    //         // ['umi-plugin-pnp', { alias: true }]
    //     ],
    // ],
    chainWebpack(config) {
        if(process.env.NODE_ENV === 'production') {
            config.merge({
                optimization: {
                    minimize: true,
                    splitChunks: {
                        chunks: 'all',
                        minSize: 30000,
                        minChunks: 3,
                        automaticNameDelimiter: '.',
                        cacheGroups: {
                            vendor: {
                                name: 'vendors',
                                test({ resource }) {
                                    return /[\\/]node_modules[\\/]/.test(resource);
                                },
                                priority: 10,
                            },
                            commons: {
                                name: 'commons',
                                chunks: 'async',
                                minChunks: 2,
                                // minChunks: Infinity,
                                minSize: 0,
                            },
                        },
                    },
                }
            });
        }

        // config.optimization.splitChunks({
        //     cacheGroups: {
        //         vendors: {
        //             name: 'vendors',
        //             chunks: 'all',
        //             test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
        //         },
        //         commons: {
        //             name: 'commons',
        //             chunks: 'async',
        //             // minChunks: 2,
        //             minChunks: 3,
        //             minSize: 0
        //         },
        //     },
        // });
    },
    alias: {
        '@': path.resolve(__dirname, './src/'),
        pages: path.resolve(__dirname, './src/pages/'),
        utils: path.resolve(__dirname, './src/utils/'),
        components: path.resolve(__dirname, './src/components/'),
        common: path.resolve(__dirname, './src/common/'),
        assets: path.resolve(__dirname, './src/assets/')
    },
    theme: './theme.config.js',
    proxy: {
        '/api': {
            // target: 'http://release-m.sosoqipei.com',
            target: 'http://dev-m.sosoqipei.com',
            // target: 'https://m.sopei.cn',
            // target: 'http://192.168.1.138:20000',
            // target: 'http://192.168.1.126:20000',
            // target: 'http://192.168.1.124:20000',
            // target: 'http://192.168.1.122:20000',
            // target: 'http://192.168.1.129:20000',
            // target: 'http:p://localhost:20000',
            // target:'http//3y2389w590.qicp.vip',
          //             // target: 'htt://3y2389w590.qicp.vip',
            changeOrigin: true,
            pathRewrite: { '^/api': '/api' }
        },
        // '/static/js': {
        //     target: 'http://localhost:8000',
        //     changeOrigin: true,
        //     pathRewrite: { '^/static/js': '/js' }
        // }
    },
    outputPath: 'dist',
    targets: { ie: 10 },
    hash: true,
    history: 'hash'
}
