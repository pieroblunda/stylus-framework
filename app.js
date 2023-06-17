import Fs from 'fs';
import Stylus from 'stylus';
import Pug from 'Pug';
import Colors from 'colors';


class StylusFramework {
  
  static compileAll() {
    this.compileStylus();
    this.compileLayoutPug();
    this.copyLayoutCss();
  }
  
  static copyTo(dir) {
    const filePath = `./dest/stylus-framework.min.css`;
    const copy = `${dir}/stylus-framework.min.css`;
    Fs.copyFile(filePath, copy, (error) => {
      if (error) {
        throw error
        return;
      }
      console.log('File has been moved to another folder.')
    })
  }
  
  static copyLayoutCss() {
    Fs.copyFileSync('style.css', './dest/style.css');
  }
  
  static compileLayoutPug() {
    
    const compiledFunction = Pug.compileFile('index.pug');

    // Render a set of data
    let content = compiledFunction();
    Fs.writeFileSync('./docs/index.html', content,'utf8');
    console.log(Colors.grey('compiled ') + `index.pug ➞ docs/index.html`);
  }
  
  static compileStylus() {
    
    let input = [{
      src: `./src/app.styl`,
      dest: `./dest/stylus-framework.min.css`
    }];
    
    let promisesBag = [];
    
    input.forEach(function(file){
      let fileStr = Fs.readFileSync(file.src, "utf8");
      let singlePromise = new Promise( (resolve, reject) => {
        Stylus(fileStr)
        .set('filename', file.src)
        .set('compress', true)
        /* @ToDo: [3] sourcemap does not work */
        // .set('sourcemap', true)
        .set('paths', [
          global.BASE_PATH + '/client/src',
          global.BASE_PATH + '/client/**',
        ])
        .render(function(err, css){
          
          if(err){
            reject(err);
            return;
          }
          
          Fs.writeFile(file.dest, css, function (err) {
            if (err){
              reject(err);
              return;
            }
            
            let compiled = {
              src: file.src,
              dest: file.dest.replace(`${process.env.BASE_PATH}/`, ''),
              code: css
            };
            resolve(compiled);
            console.log(Colors.grey('compiled ') + `${compiled.src} ➞ ${file.dest}`);
          });
        });
      });
      promisesBag.push(singlePromise);
    });
    
    return Promise.all(promisesBag);
  } // compileStylus()
  
}

export default StylusFramework;

StylusFramework.compileAll();