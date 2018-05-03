const xml2js = require('xml2js');
const parseString = xml2js.parseString;
const builder = new xml2js.Builder({
  headless: true,
  renderOpts: { pretty: false }
});

const { promisify } = require('util');

exports.builder = builder;

exports.xml2js = promisify(parseString);

exports.makeIcon = function(rawIcon, params) {
  const DEFAULT_SIZE = 32;
  const color = /^[0-9A-F]{6}$/i.test(params.color) ? '#' + params.color : '';
  const size = (params.size && parseInt(params.size)) || DEFAULT_SIZE;

  return new Promise((done, fail) => {
    parseString(rawIcon, function(err, objSvg) {
      if (err) {
        return fail(err);
      }

      objSvg.svg.$.width = size;
      objSvg.svg.$.height = size;
      delete objSvg.svg.style;

      if (objSvg.svg.$.fill != 'none') {
        objSvg.svg.$.fill = color || objSvg.svg.$.fill || '';
      } else if (objSvg.svg.$.stroke != 'none') {
        objSvg.svg.$.stroke = color || objSvg.svg.$.stroke;
      }
      try {
        const res = builder.buildObject(objSvg);
        done(res);
      } catch (e) {
        fail(e);
      }
    });
  });
};