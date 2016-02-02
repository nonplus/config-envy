# config-envy

[![NPM version](http://img.shields.io/npm/v/config-envy.svg?style=flat)](https://www.npmjs.org/package/config-envy)
[![Dependency Status](http://img.shields.io/david/VivintSolar/config-envy.svg?style=flat)](https://david-dm.org/VivintSolar/config-envy)
[![Dev Dependency Status](http://img.shields.io/david/dev/VivintSolar/config-envy.svg?style=flat)](https://david-dm.org/VivintSolar/config-envy#info=devDependencies&view=table)
[![Code Climate](http://img.shields.io/codeclimate/github/VivintSolar/config-envy.svg?style=flat)](https://codeclimate.com/github/VivintSolar/config-envy)
[![Build Status](http://img.shields.io/travis/VivintSolar/config-envy/master.svg?style=flat)](https://travis-ci.org/VivintSolar/config-envy)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/VivintSolar/config-envy.svg?style=flat)](https://codeclimate.com/github/VivintSolar/config-envy)

`config-envy` is both a command-line tool and a module to manage sensitive
configuration files in Amazon AWS S3. The command-line tool is used to pull and
store the files in S3, and the module is used to consume the configuration in
your application.

# Setup

```sh
npm install --save-dev config-envy # to install locally and use in your package.json scripts
npm install -g config-envy # to install globally if you prefer
```

You need to create a `.config-envyrc` file to configure your available
configuration lanes and settings. It should look something like this:

```js
{
  "projectName": "yourProjectName", // This is required
  "storage": "s3", // This is required. It can be a built in storage method (like s3) or a path to your own storage method adapter
  "defaults": { // This is the default config for your all of your lanes.
    "env": "{laneKey}", // env is the value to look for in NODE_ENV to use the specified .env file
    "local": "config/{laneKey}.env", // The local path to save a lane's .env
    // Each adapter has their own set of options. s3 requires these three for each lane
    "bucket": "com.company.xyz", // The s3 bucket to upload/download from
    "region": "us-west-2", //
    "key": "{projectName}/{laneKey}/.env" // The path to save into s3
  },
  "lanes": {
    // Each config lane needs to be declared here. Override the default options in each lane as needed
    "prod": {
      "env": "production"
    },
    "stage": {
      "env": "staging"
    },
    "development": {} // This this just uses the default config
  }
}
```

Once that file is in place in your project, you can use the command-line to save
and retrieve environment files.

You'll want to add your config files to your `.gitignore`. So `*.env`, should
be good to add to your `.gitignore` unless you use a different extension for
this config files.

# Command-Line

```
  Usage: config-envy [options] <lane|all> [get|put]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -l, --list     List the available lanes
    -c, --config   Show the paths to the configuration files that are being used
    -i, --init     Initialize the local .env files
```

If you're starting a new project, run `config-envy --init` to create a bunch of
blank `.env` files for each of your configuration lanes. If you run it more than
once, it won't override the files that already exist.

Go into each of your `.env` files and add your environment config as such:

```
SUPER_SECRET_URL=http://www.google.com
MY_PASSWORD=spike
```

If you want to push up config files, use this command:

```sh
config-envy [lane name] put
```

If you want to get a config file from s3, use this command:

```sh
config-envy [lane name] get
```

If you want to display the config for a given lane, use this command:

```sh
config-envy [lane name]
```

In place of `[lane name]`, you can use `all` if you want to perform actions for
all of the given config lanes.

# Module

The module is used to consume those `.env` files and put them into your
`process.env` at runtime. Default options are shown.

```js
require('config-envy')({
  env: process.env.NODE_ENV, // The environment config to pull from. Will be based on the `env` property of the lane
  cwd: process.cwd(), // The current working directory to base storage options from
  localEnv: '.env', // The path to an overriding .env for the local environment
  overrideProcess: false, // Set to true if you want the existing environment variables to be overridden by your .env files
  silent: false, // Set to true if you want to be notified of any errors that happen when trying to read your .env files
});
```

# Storage Adapters

There are a couple storage adapters built into `config-envy`. "Additional
required options" refer to the additional lane options that are required for
that given storage method. `env` and `local` are required for all of them. You
can of course set defaults and not set them in your specific lane configs.

## `fs`

This is a storage option that saves your original .env files somewhere else on
you system.

### Additional required options

* `remotePath` - The path to save the lane's config file "remotely" (still on
  your file system, just in a different place than your project).

## `s3`

This is a storage option that saves your original .env files in s3. Note that
with this adapter, you need to have your local credentials file set up on your
machine as outlined
[here](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Creating_the_Shared_Credentials_File).

### Additional required options

* `region` - The s3 region where the bucket lives.
* `bucket` - The bucket you wish to save the file to.
* `key` - The key or path you wish to save the file to in the given bucket.

## Custom Adapters

If you wish to use a custom adapter, put in the path to your custom adapter in
the `storage` option in your `config-envyrc`.

```json
{
  "projectName": "myProject",
  "storage": "./node_modules/custom-adapter",
  ...
}
```

Your custom adapter module should have several properties on it. This is an
example adapter. Pay attention to the comments as they outline what do expect:

```js

/**
 * @function download
 * This function gets called when the `get` command is sent.
 * @param {Object} options
 * @param {string} options.env - The lane's environment variable for NODE_ENV
 * @param {string} options.local - The local (relative) path to save the file
 * @param {string} options.localPath - The local (absolute) path to save the file
 * @param {string} options.* - Any additional property that you required
 * @param {string} name - The name of the lane
 * @returns {Mixed} whatever you want! It can be asynchronous or whatever.
 */
exports.download = function(options, name) {

};

/**
 * @function upload
 * This function gets called when the `put` command is sent. Note that this
 * isn't required as you may have an adapter you don't want people overwriting
 * in your remote location.
 *
 * All of the @params are the same as download
 */
exports.upload = function(options, name) {

};

/**
 * @name requiredOptions
 * An array of strings, which are the required options you want for your
 * adapter. This isn't required.
 */
exports.requiredOptions = [];

```
