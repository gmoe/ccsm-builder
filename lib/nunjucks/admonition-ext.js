"use strict";

module.exports = function(nunjucks) {

  const types = [ 'warning', 'tip', 'note', 'important' ];

  return function AdmonitionExtension(_env) {
    this.tags = ['admonition'];

    this.parse = function(parser, nodes, lexer) {
      let tok = parser.nextToken();
      let args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);

      let body = parser.parseUntilBlocks('endadmonition');
      parser.advanceAfterBlockEnd();

      return new nodes.CallExtension(this, 'run', args, [body]);
    };

    this.run = function(context, admonitionType, title, body) {
      if (!types.reduce((p,c) => p = p || (c === admonitionType), false)) {
        throw "Admonition: Illegal type."
      }

      let ret = new nunjucks.runtime.SafeString(
        '<div class="admonition-'+admonitionType+' admonition">'+
          '<p class="admonition-title">'+title+'</p>'+
          '<p class="admonition-body">'+body()+'</p>'
        +'</div>'
      );
      return ret;
    };
  }
}
