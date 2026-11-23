/* Rebuild the self-contained Shopify WebGL hero.
   Run: npm install --prefix scripts --no-save three@0.181.2 esbuild@0.27.0
        node scripts/build-hero.cjs
*/
const path=require('path');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
esbuild.build({
  entryPoints:[path.join(__dirname,'cham8-hero.src.js')],
  absWorkingDir:root,bundle:true,minify:true,platform:'browser',format:'iife',
  target:'es2020',nodePaths:[path.join(__dirname,'node_modules')],
  outfile:path.join(root,'assets/cham8-hero.js'),legalComments:'none'
}).catch(err=>{console.error(err);process.exit(1)});
