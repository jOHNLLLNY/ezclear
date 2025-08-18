module.exports = {
  input: [
    'app/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
  ],
  output: './i18n/_extracted',
  options: {
    lngs: ['en', 'uk'],
    defaultLng: 'en',
    defaultNs: 'translation',
    resource: {
      loadPath: 'i18n/_extracted/{{lng}}.json',
      savePath: '{{lng}}.json'
    },
    func: {
      list: ['i18n.t', 't'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaultValue'
    },
    keySeparator: '.',
    nsSeparator: ':',
    sort: true
  }
}

