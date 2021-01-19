#!/usr/bin/env node

const dedent = require('dedent');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const pkg = require('../package.json');
const context = {
    cliVersion: pkg.version
}

// console.log(hideBin(process.argv)) // [ '--help', '*', ... ]
// const argv = yargs(hideBin(process.argv)).argv;
const cli = yargs(hideBin(process.argv))

cli
    .usage('Usage: $0 <command> [options]') // $0: argv 中 $0，即脚手架软链接名称 zjw-cli-test
    .strict() // 输入不存在命令会给出提示
    .demandCommand(1, 'A command is required. Pass --help to see all available commands and options.') // 最少需要一个 command
    .recommendCommands() // 当输入一个不存在的命令时会给出最接近的命令
    .fail((msg, err) => { // 不写 fail，输入错误指令会给出 --help 结果
        console.log('msg: ', msg)
    })
    .alias('h', 'help')
    .alias('v', 'version')
    .wrap(cli.terminalWidth()) // 将宽度设置为终端的宽度
    .epilogue(dedent`
        Your own log
    `) // 在最后面输出的信息
    .options({
        'debug': {
            type: 'boolean',
            describe: 'Bootstrap debug mode',
            alias: 'd'
        }
    })
    .option('registry', {
        type: 'string',
        describe: 'Define global registry: npm, yarn',
        alias: 'r'
    })
    .group(['debug'], 'Debug Options:')
    .group(['r'], 'Repository Options:')
    .command(
        'init [name]',
        'do init project',
        yargs => {
            yargs.option('name', {
                type: 'string',
                describe: 'Name of project',
                alias: 'n'
            })
        },
        argv => {
            console.log(argv)
        }
    )
    .command({
        command: 'list',
        aliases: ['ll', 'la', 'ls'],
        describe: "List local packages",
        builder: yargs => {},
        handler: argv => {
            console.log(argv)
        }
    })
    // .argv // 处理使用 .argv 的方式来完成参数解析外，还可以调用 yargs.parse 来完成命令行参数解析
    // .parse(process.argv.slice(2), context)
    .parse(hideBin(process.argv), context) // hideBin(process.argv) 等价于 process.argv.slice(2)。parse 会将两个对象合并成一个新的对象最为命令行参数。

