module.exports = {
  default: {
    require: [
      'features/support/world.ts',
      'features/hooks/hooks.ts',
      'features/step_definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ],
    parallel: 1,
    timeout: 120000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
