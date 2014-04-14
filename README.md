[Web Toolkit](http://skyglobal.github.io/web-toolkit/) [![Build Status](https://circleci.com/gh/skyglobal/web-toolkit.png?circle-token=24eeba25d7352dec038ea9fa25b22671ba28be5e)](https://circleci.com/gh/skyglobal/web-toolkit) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
========================

> Sky branded front end web framework and style guide.


## Building the Toolkit locally
### Prerequisites

- RVM
- Ruby (version 1.9.3 or later)
- npm
- grunt

### Setup
1. Fork the web-toolkit repository from this skyglobal user into your own user area (fork button, top right)
2. clone your new repo onto your local machine (get the clone url from the right menu also)
  - `git clone [CLONE-URL]`
  - `git remote add upstream https://github.com/skyglobal/web-toolkit.git`
3. Install npm on your machine
  - `echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc`
  - `. ~/.bashrc`
  - `mkdir /usr/local`
  - `mkdir ~/node-latest-install`
  - `cd ~/node-latest-install`
  - `curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1`
  - `./configure --prefix=/usr/local`
  - `make install`
  - `curl https://npmjs.org/install.sh | sh`
4. Install grunt either globally, or run the following to use the bundled project grunt
  - `npm install`
5. Install the require gems using Bundler
  - `bundle install`
6. Install Grunt CLI 
  - `npm install -g grunt-cli`

### Running

Grunt is our friend here, he will take of reloading the jekyll project whenever a file is edited.

1. In the root of the project, run the following:
  - `grunt server` (add ` --beautify` to help when debugging)

## Contributing 

###Building A New/Updated Feature
  - Write code in a new branch.
  - Before you start a feature, ensure your code is up to date. Run:
    - `git pull upstream master`
  - Write tests as you go
  - Refactor so the code is self documenting
  - If you would like the feature to go live sooner, mention this in the comments/commit.  We will provide a temporary live url that will allow you to carry on without getting blocked.

### Testing
  - Tests are automatically run on the CircleCI server upon pushing to Github.
  - Two sets of tests are run:
    - first run is on production ready 'minified' code
    - second run on 'beautified' code with code coverage reporting, please keep this above 80%
  - Run `grunt test` for unit (using [mocha](http://visionmedia.github.io/mocha/) and [chai](http://chaijs.com/‎))


###Committing

Before you submit your pull request, run :
  - `git pull upstream master` to ensure your code is up to date and merged correctly
  - `grunt test-cross-browser`. You will need to set up a [Browser Stack](http://www.browserstack.com) account.


## Code structure

    $ tree
    .
    ├── _includes       => Source code for the toolkit documentation. Your demo html goes here
    │   └── allIncludes.html => a single file referencing all includes. used for demo and test page
    ├── _layouts        => layout for the index and test html pages
    ├── _site           => content generated by Jekyll
    ├── dist            => content generated by Grunt
    ├── grunt           => dev area for source code. get stuck in
    │   ├── fonts       => templates used to generate the font icons (skycons)
    │   ├── icons       => icons that are multi coloured and used within scss for spriting (not yet converted to svg's)
    │   ├── js          => place for source JS files
    │   ├── sass        => place for source SCSS files
    │   └── svgs        => retina ready multi-coloured icons.
    ├── node_modules    => npm plugins
    ├── static          => home of the unchanging and non-generated code
    │   ├── deprecated  => code moved from the masthead project
    │   ├── font-svgs   => src svg files used to generate font icons (skycons)
    │   ├── fonts       => Sky Text Fonts
    │   ├── images      => images not for spriting
    │   ├── lib         => untouched third-party files
    |   └── wiki-images => images used for demos in the wiki
    ├── test
    │   ├── libararies  => Third-party src files for testing
    │   ├── specs       => place for *-spec.js files
    │   ├── screenshots
    │   ├── config.js   => RequireJS and Mocha config file
    │   └── runner.js   => explitly call each spec file for `grunt test` to run
    ├── config.yml      => Jekyll config file
    ├── changes.html    => Page for users to see changes between toolkit version
    ├── circle.yml      => CircleCI config file
    ├── gemfile
    ├── gruntfile.js    => grunt config file
    ├── index.html      => Main demo page
    ├── package.json    => NodeJS config file, includes version number for toolkit
    ├── rakefile        => build script
    ├── test.html       => used by `grunt test` to run all tests at once
    └── README.md
    
## Deployments

To release a new version with:
  - Code changes
    - increment the version number in package.json following `semantic versioning` described below.
    - This will update gh-pages and the S3.
  - Documentation changes
    - Don't increment the version number.
    - This will update gh-pages branch only.
  - Feature releases
    - To be used when contributers want to integration test a new feature/proposed pull requrest.
    - Ensure that the code is committed in a branch that starts with `feature-xxx`. Where xxx is feature.
    - Add `-feature-xxx` to the end of the version number e.g. `1.0.1-feature-fancy-carousel`.
    - This will update the S3 only
  - Release Candidate changes
    - To be used when new features/bugs fixes have been merged and is ready to be integration test by toolkit owners.
    - Commit the code into a branch that starts with `rc-111`. Where 111 is the version number.
    - Add `-rc-111` to the end of the version number e.g. `1.0.1-rc-2`.
    - This will update the S3 only.

Feature and RC releases will be available by going to http://web-toolkit.global.sky.com/ and adding either `x.x.x-feature-111/` or `x.x.x-rc-111`. where x.x.x is the current toolkit version number.  Please give the contributor the full URL in a comment along side their pull request / issue.

#### Versioning
This library should follow the [Semantic versioning specification](http://semver.org/).
In short, that means the following:

Version: X.Y.Z(-rc)?

- API changes that are **not backwards compatible**, and break existing
  calls using the API must increment the X value.

- API changes that introduce **new backwards compatible changes**, or **change the
  internals**, but not the interface, of existing methods will increment the
  Y value.

- **Patches or bug fixes** that are backwards compatible should increment the
  Z value.

- -rc Represents 'release candidates'.  This is to create a public available url for testing purposes.

Upon commiting and pushing your code to Github, the CI server will run through
the functional tests and - if there are no errors - a new version of the library
will be deployed to the CDN using the version number specified in the
package.json file.

