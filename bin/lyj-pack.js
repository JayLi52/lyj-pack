#! /usr/bin/env node
let path = require('path')

let config = require(path.resolve('webpack.config.js'))
let Complier = require('../lib/complier.js')
let complier = new Complier(config)
// 标识运行编译
complier.run()