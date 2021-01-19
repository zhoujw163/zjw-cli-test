#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();

const pkg = require('../package.json');

// 配置全局属性
program
    // 在 Commander 7 以前，选项的值是作为属性存储在 command 对象上的。 
    // 这种处理方式便于实现，但缺点在于，选项可能会与Command的已有属性相冲突。
    // 通过使用.storeOptionsAsProperties()，可以恢复到这种旧的处理方式，并可以不加改动的继续运行遗留代码。
    // Commander 7之后所有的属性都要通过 opts() 获取
    .storeOptionsAsProperties()
    // .name 和 .usage 用来修改帮助信息的首行提示。name 属性也可以从参数自动推导出来。
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [option]')
    .version(pkg.version)
    // 配置 option 并设置默认值
    .option('-d, --debug', '开启调试模式', false)
    // 配置 option，指定参数
    .option('-e, --envName <envName>', '输出环境变量名称');

// command 注册命令，注意：调用 command 方法返回的时命令对象而不是脚手架对象
const clone = program.command('clone <source> [destination]');
clone
    .description('clone a repository')
    .option('-f, --force', '是否强制克隆')
    .action((source, destination, cmdObj) => {
        console.log('clone command called', source, destination, cmdObj.force);
    });

// addCommand 注册子命令
const service = new commander.Command('service');

service
    .command('start [port]')
    .description('service start at same port')
    .action((port) => {
        console.log('service starting at ', port);
    });

service
    .command('stop')
    .description('stop service')
    .action(() => {
        console.log('service stop');
    })

program
    .addCommand(service);

/**
 * @description 独立执行的命令
 * 当.command()带有描述参数时，就意味着使用独立的可执行文件作为子命令。
 * Commander 将会执行一个新的命令。新的命令为： 脚手架命令-注册的命令，如下例中未配置 executableFile 前执行的是 'zjw-cli-test-install'。
 * 通过配置选项 executableFile 可以自定义名字。
 * 这种方式可以实现脚手架之间的嵌套调用
 */
program
    .command('install [name]', 'install package', {
        executableFile: 'zjw-cli', // 由原先的 zjw-cli-test-install 改为执行 zjw-cli
        // isDefault: true, // 默认执行该命令，即执行 zjw-cli-test 就是执行 zjw-cli-test install
        hidden: true // 在帮助文档中隐藏该命令
    })
    .alias('i')

// arguments 可以为最顶层命令指定命令参数。如下例：表示配置一个必选命令 username 和一个可选命令 password。
// arguments 指定的命令参数是泛指，只要不是 command 和 addCommand 注册的命令都会被捕获到。
// zjw-cli-test abc => username 就是 abc
// 可以向.description()方法传递第二个参数，从而在帮助中展示命令参数的信息。该参数是一个包含了 “命令参数名称：命令参数描述” 键值对的对象。
// program
//     .arguments('<username> [password]')
//     .description('test command', {
//         username: 'user to login',
//         password: 'password for user, if required'
//     })
//     .action((username, password) => {
//         console.log(username, password);
//     });

/**
 * @description 自定义 help 信息
 * 方法一： 步骤一：重写 helpInformation，返回值是啥 help 信息就是啥；。
 * 方法二： 步骤一：重写 helpInformation，返回值空字符串； 步骤二： 调用 on 方法监听 --help，在回调函数中输出 help 信息。
 * 方法三： 步骤一：重写 helpInformation，返回值空字符串； 步骤二： 调用 addHelpText 方法
 * 如果你不想清除内建的帮助信息，方法一：不重新 helpInformation，只监听 --help； 方法二： 调用 addHelpText 方法（建议这种）
 */

// // 清空内建的帮助信息
// program.helpInformation = function() {
//     return '';
// }

// // 添加自定义信息
// program.on('--help', function() {
//     console.log('output your help information')
// })

program.helpInformation = function() {
    return 'output your help information\n';
}


/**
 * @description 实现 debug 模式
 * 方法一： 调用 on 方法监听 --debug
 * 方法二： 调用 on 方法监听 option:debug
 */
program.on('option:debug', () => {
    console.log('debug: ', program.debug)
    process.env.LOG_LEVEL = 'verbose'
})

/**
 * @description 监听未知的命令
 */
program.on('command:*', (obj) => {
    console.log(obj);
    console.error('未知的命令：', obj[0]);
    // 获取所有已注册的命令
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.log('可用命令：', availableCommands.join(', '))
})


// 解析参数
program
    .parse(process.argv);


