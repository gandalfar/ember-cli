'use strict';

const expect = require('chai').expect;
const map = require('ember-cli-lodash-subset').map;
const commandOptions = require('../../factories/command-options');
const NewCommand = require('../../../lib/commands/new');
const Promise = require('../../../lib/ext/promise');
const Blueprint = require('../../../lib/models/blueprint');
const Command = require('../../../lib/models/command');
const Task = require('../../../lib/models/task');
const td = require('testdouble');

describe('new command', function() {
  let command;

  beforeEach(function() {
    let options = commandOptions({
      project: {
        isEmberCLIProject() {
          return false;
        },
        blueprintLookupPaths() {
          return [];
        },
      },
    });

    command = new NewCommand(options);

    td.replace(Blueprint, 'lookup', td.function());
  });

  afterEach(function() {
    td.reset();
  });

  it('doesn\'t allow to create an application named `test`', function() {
    return command.validateAndRun(['test']).then(function() {
      expect(false, 'should have rejected with an application name of test').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `test`.');
    });
  });

  it('doesn\'t allow to create an application named `ember`', function() {
    return command.validateAndRun(['ember']).then(function() {
      expect(false, 'should have rejected with an application name of ember').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `ember`.');
    });
  });

  it('doesn\'t allow to create an application named `Ember`', function() {
    return command.validateAndRun(['Ember']).then(function() {
      expect(false, 'should have rejected with an application name of Ember').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `Ember`.');
    });
  });

  it('doesn\'t allow to create an application named `ember-cli`', function() {
    return command.validateAndRun(['ember-cli']).then(function() {
      expect(false, 'should have rejected with an application name of ember-cli').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `ember-cli`.');
    });
  });

  it('doesn\'t allow to create an application named `vendor`', function() {
    return command.validateAndRun(['vendor']).then(function() {
      expect(false, 'should have rejected with an application name of `vendor`').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `vendor`.');
    });
  });

  it('doesn\'t allow to create an application with a period in the name', function() {
    return command.validateAndRun(['zomg.awesome']).then(function() {
      expect(false, 'should have rejected with period in the application name').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `zomg.awesome`.');
    });
  });

  it('doesn\'t allow to create an application with a name beginning with a number', function() {
    return command.validateAndRun(['123-my-bagel']).then(function() {
      expect(false, 'should have rejected with a name beginning with a number').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('We currently do not support a name of `123-my-bagel`.');
    });
  });

  it('shows a suggestion messages when the application name is a period', function() {
    return command.validateAndRun(['.']).then(function() {
      expect(false, 'should have rejected with a name `.`').to.be.ok;
    })
    .catch(function(error) {
      expect(error.message).to.equal('Trying to generate an application structure in this directory? Use `ember init` instead.');
    });
  });

  it('registers blueprint options in beforeRun', function() {
    td.when(Blueprint.lookup('app'), { ignoreExtraArgs: true }).thenReturn({
      availableOptions: [
        { name: 'custom-blueprint-option', type: String },
      ],
    });

    command.beforeRun(['app']);
    expect(map(command.availableOptions, 'name')).to.contain('custom-blueprint-option');
  });

  it('passes command options through to init command', function() {
    command.tasks.CreateAndStepIntoDirectory = Task.extend({
      run() {
        return Promise.resolve();
      },
    });

    command.commands.Init = Command.extend({
      run(commandOptions) {
        expect(commandOptions).to.contain.keys('customOption');
        expect(commandOptions.customOption).to.equal('customValue');
        return Promise.resolve('Called run');
      },
    });

    td.when(Blueprint.lookup('app'), { ignoreExtraArgs: true }).thenReturn({
      availableOptions: [
        { name: 'custom-blueprint-option', type: String },
      ],
    });

    return command.validateAndRun(['foo', '--custom-option=customValue']).then(function(reason) {
      expect(reason).to.equal('Called run');
    });
  });
});
