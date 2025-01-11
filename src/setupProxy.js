const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log('use proxy for edge-config');
    app.use(
        '/ecfg_w4zw6wslhri1puoaacsrzvx583rw',
        createProxyMiddleware({
            target: 'https://edge-config.vercel.com',
            changeOrigin: true,
            pathRewrite: {
                '^/ecfg_w4zw6wslhri1puoaacsrzvx583rw': '/ecfg_w4zw6wslhri1puoaacsrzvx583rw',
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
            },
        })
    );
}; 