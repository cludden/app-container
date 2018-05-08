# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.1"></a>
## [1.1.1](https://github.com/cludden/app-container/compare/v1.1.0...v1.1.1) (2018-05-08)


### Bug Fixes

* fixes `Unknown Component` error that occurred when loading multiple plugins where one or more have no matches ([157812b](https://github.com/cludden/app-container/commit/157812b)), closes [#9](https://github.com/cludden/app-container/issues/9)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/cludden/app-container/compare/v1.1.0-beta.0...v1.1.0) (2018-04-03)



<a name="1.1.0-beta.0"></a>
# [1.1.0-beta.0](https://github.com/cludden/app-container/compare/v1.0.0...v1.1.0-beta.0) (2018-03-03)


### Features

* **plugins:** adds `container!` plugin to support dynamic component and container behavior at runtime ([ba8fcaa](https://github.com/cludden/app-container/commit/ba8fcaa))
* overloads `register` method to support both `register(mod, name, options)` and `register(mod, options)` call signatures ([e8d29ba](https://github.com/cludden/app-container/commit/e8d29ba))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/cludden/app-container/compare/v1.0.0-beta.0...v1.0.0) (2017-11-03)



<a name="1.0.0-beta.0"></a>
# [1.0.0-beta.0](https://github.com/cludden/app-container/compare/v0.4.8...v1.0.0-beta.0) (2017-10-18)


### Bug Fixes

* adds security check using nsp ([86d6177](https://github.com/cludden/app-container/commit/86d6177))
* updates docker & compose files to allow for testing in docker environment ([bb4632a](https://github.com/cludden/app-container/commit/bb4632a))


### Features

* adds `register` method to container for manually registering components ([36463c0](https://github.com/cludden/app-container/commit/36463c0))
* adds support for single array argument to container#load method ([b90a710](https://github.com/cludden/app-container/commit/b90a710))
* changes glob options to be a direct passthrough to glob ([00e4df7](https://github.com/cludden/app-container/commit/00e4df7))


### BREAKING CHANGES

* removes "dir" requried option to glob



<a name="0.4.8"></a>
## [0.4.8](https://github.com/cludden/app-container/compare/v0.4.7...v0.4.8) (2017-10-11)


### Bug Fixes

* adds .babelrc to .npmignore to prevent dependency conflicts ([2e60118](https://github.com/cludden/app-container/commit/2e60118))



<a name="0.4.7"></a>
## [0.4.7](https://github.com/cludden/app-container/compare/v0.4.6...v0.4.7) (2017-07-05)


### Bug Fixes

* removes `mocha` from dependencies ([d251101](https://github.com/cludden/app-container/commit/d251101))



<a name="0.4.6"></a>
## [0.4.6](https://github.com/cludden/app-container/compare/v0.4.5...v0.4.6) (2017-05-24)


### Bug Fixes

* git mistakes, brain dead ([c4a7590](https://github.com/cludden/app-container/commit/c4a7590))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/cludden/app-container/compare/v0.4.4...v0.4.5) (2017-05-24)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/cludden/app-container/compare/v0.4.3...v0.4.4) (2017-05-24)


### Bug Fixes

* adds registration error to debug info for clarity ([8735f10](https://github.com/cludden/app-container/commit/8735f10))
* support "any!" and "all!" as module requirements ([5a34a33](https://github.com/cludden/app-container/commit/5a34a33))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/cludden/app-container/compare/v0.4.2...v0.4.3) (2017-04-11)


### Bug Fixes

* add debugging info to README ([e9a4ba2](https://github.com/cludden/app-container/commit/e9a4ba2))
* update README.md with additional documentation ([4135e21](https://github.com/cludden/app-container/commit/4135e21))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/cludden/app-container/compare/v0.4.1...v0.4.2) (2017-04-05)


### Bug Fixes

* remove last remaining remnants of legacy declaration style ([a71eb48](https://github.com/cludden/app-container/commit/a71eb48))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/cludden/app-container/compare/v0.4.0...v0.4.1) (2017-04-05)


### Bug Fixes

* ignore modules that lack a namespace definition ([280a9bc](https://github.com/cludden/app-container/commit/280a9bc))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/cludden/app-container/compare/v0.3.2...v0.4.0) (2017-04-05)


### Features

* adds error notification when a component fails to register, removes support for register function ([01d2db3](https://github.com/cludden/app-container/commit/01d2db3))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/cludden/app-container/compare/v0.3.1...v0.3.2) (2017-04-03)


### Bug Fixes

* fix issue with error stacktraces ([bae285b](https://github.com/cludden/app-container/commit/bae285b))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/cludden/app-container/compare/v0.3.0...v0.3.1) (2017-04-03)


### Bug Fixes

* fix issue with nested require declaration ([9d69206](https://github.com/cludden/app-container/commit/9d69206))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/cludden/app-container/compare/v0.2.0...v0.3.0) (2017-04-03)


### Features

* adds `all!` and `any!` plugins with tests ([508be75](https://github.com/cludden/app-container/commit/508be75))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/cludden/app-container/compare/v0.1.1...v0.2.0) (2017-04-02)


### Bug Fixes

* updates README with simple example ([0150770](https://github.com/cludden/app-container/commit/0150770))


### Features

* adds support for namespaced approach ([c9693ca](https://github.com/cludden/app-container/commit/c9693ca))
* adds support for namespaced approach ([2cbb3eb](https://github.com/cludden/app-container/commit/2cbb3eb))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/cludden/app-container/compare/v0.1.0...v0.1.1) (2017-03-31)


### Bug Fixes

* **main:** fix broken main reference in package.json ([c09248b](https://github.com/cludden/app-container/commit/c09248b))



<a name="0.1.0"></a>
# 0.1.0 (2017-03-31)


### Features

* initial api settled and all tests passing ([ea6b0d1](https://github.com/cludden/app-container/commit/ea6b0d1))
