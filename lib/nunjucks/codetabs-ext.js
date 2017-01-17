"use strict";

module.exports = function(nunjucks) {

  const languages = {
    "sc": "SuperCollider",
    "faust": "Faust",
    "max": "Max 7"
  };

  return function CodeTabsExtension(_env) {
    this.tags = ['codetabs'];

    this.parse = function(parser, nodes, lexer) {
      let tok = parser.nextToken();
      let args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);

      let bodies = [];
      bodies[0] = parser.parseUntilBlocks('lang', 'endcodetabs');

      while(parser.skipSymbol('lang')) {
        parser.skip(lexer.TOKEN_BLOCK_END);
        bodies.push(parser.parseUntilBlocks('lang', 'endcodetabs'));
      }

      parser.advanceAfterBlockEnd();

      return new nodes.CallExtension(this, 'run', args, bodies);
    };

    this.run = function(...args) {
      const langArgs = args.slice(1);
      var numLangs = 0;

      //Make sure lang body count and lang type count match, and lang is valid
      langArgs.forEach((arg) => { 
        if (typeof arg === 'string') {
          numLangs++; 
          if(!arg in languages) {
            console.error('codetabs: language type "'+arg+'" not valid');
          }
        }
      });
      if(langArgs.length % numLangs != 0) console.error('codetabs: not enough lang arguments');

      var bodies = langArgs.slice(numLangs);
      var ret = '<div class="codetabs">';
      var id = 'codetab' + Math.floor(Math.random() * 10000);
      for(var i=0; i < bodies.length; ++i) {
        ret += `<input name="codetab" id="${id+i}" type="radio" ${i==1?'checked':''}>`;
        ret += `<section>`;
        ret += `<h1><label for="${id+i}">${languages[langArgs[i]]}</label></h1>`;
        ret += `<pre><code>${bodies[i]().trim()}</code></pre>`;
        ret += `</section>`;
      }
      ret += '</div>';
      
      return new nunjucks.runtime.SafeString(ret);
    };
  }
}
