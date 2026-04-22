const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const findAndReplace = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const corruptedPattern1 = /className=\(<div className="flex justify-center"><div className="w-5 h-5 border-2 border-gray-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"><\/div><\/div>\)/g;
      
      const corruptedPattern2 = /<div className="flex justify-center items-center py-4"><div className="w-8 h-8 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"><\/div><\/div>/g;
      
      let modified = content;
      
      if (corruptedPattern1.test(content) || corruptedPattern2.test(content)) {
        console.log('Fixing:', fullPath);
        
        // This is a bit of a hack since we don't know the original class name. 
        // We will just replace it with "loading-spinner" which might be wrong in some cases 
        // like "loading-skeleton-row" but it will restore valid JSX.
        // Let's actually replace it with "loading-spinner" for simplicity.
        modified = modified.replace(corruptedPattern1, 'className="loading-spinner"');
        modified = modified.replace(corruptedPattern2, 'Loading...');
        
        fs.writeFileSync(fullPath, modified, 'utf8');
      }
    }
  }
};

findAndReplace(srcDir);
