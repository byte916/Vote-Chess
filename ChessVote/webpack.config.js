"use strict"
{
    // Требуется для формирования полного output пути
    let path = require('path');

    // Плагин для очистки выходной папки (bundle) перед созданием новой
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    const TerserJSPlugin = require('terser-webpack-plugin');
    const webpack = require('webpack');

    // Путь к выходной папке
    const bundleFolder = "wwwroot";

    module.exports = function (env) {
        return {
            devtool: env === 'development' ? "source-map" : false,
            // Точка входа в приложение
            entry: {
                site: [
                    "./node_modules/jquery/dist/jquery.js",
                    "./node_modules/toastr/build/toastr.min.css",
                    "./node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.js",
                    "./node_modules/chess.js/chess.js",
                    "./node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css",
                    "./scripts/main.ts"
                ]
            },

            // Выходной файл
            output: {
                filename: '[name]/script.js',
                path: path.resolve(__dirname, bundleFolder)
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                    "window.jQuery": "jquery"
                }),
                new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['[name]/'] }),
                new MiniCssExtractPlugin(),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorPluginOptions: {
                        preset: ['default', { discardComments: { removeAll: true } }],
                    }
                })
            ],
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'ts-loader',
                        exclude: [/node_modules/],
                    }, {
                        test: /\.less|\.css/i,
                        use: [MiniCssExtractPlugin.loader, {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        }, 'less-loader']
                    }]
            }, resolve: {
                extensions: ['.tsx', '.ts', '.js', '.less'],
                alias: {
                    jquery: "jquery/src/jquery"
                }
            }, optimization: {
                minimizer: [new TerserJSPlugin(), new OptimizeCSSAssetsPlugin()],
            }
        }
    }
}