// Script to fix TypeScript errors in the codebase
const fs = require('fs');
const path = require('path');

// Type error fixes
const typeErrorFixes = [
  {
    file: 'app/api/deck/generate/route.ts',
    fixes: [
      {
        search: '.map(stat =>',
        replace: '.map((stat: any) =>'
      },
      {
        search: '.map(insight =>',
        replace: '.map((insight: any) =>'
      },
      {
        search: '.map(i =>',
        replace: '.map((i: any) =>'
      },
      {
        search: '.reduce((sum, item) =>',
        replace: '.reduce((sum: any, item: any) =>'
      },
      {
        search: '.reduce((max, item) =>',
        replace: '.reduce((max: any, item: any) =>'
      },
      {
        search: '.reduce((min, item) =>',
        replace: '.reduce((min: any, item: any) =>'
      },
      {
        search: '.map(cat =>',
        replace: '.map((cat: any) =>'
      },
      {
        search: '.sort((a, b) =>',
        replace: '.sort((a: any, b: any) =>'
      },
      {
        search: '.map(m =>',
        replace: '.map((m: any) =>'
      }
    ]
  },
  {
    file: 'app/api/presentations/[id]/export/route.ts',
    fixes: [
      {
        search: 'parseInt(id)',
        replace: 'parseInt(id as string)'
      }
    ]
  },
  {
    file: 'app/api/upload/route.ts',
    fixes: [
      {
        search: 'result.rowCount',
        replace: '(result as any).rowCount'
      },
      {
        search: 'result.columns',
        replace: '(result as any).columns'
      }
    ]
  },
  {
    file: 'app/auth/signup/page.tsx',
    fixes: [
      {
        search: '"microsoft"',
        replace: '"github"' // Replace microsoft with github as it's not supported
      }
    ]
  },
  {
    file: 'app/dashboard/page.tsx',
    fixes: [
      {
        search: 'user.id',
        replace: 'user?.id'
      },
      {
        search: 'user.email',
        replace: 'user?.email'
      }
    ]
  },
  {
    file: 'app/internal-test/page.tsx',
    fixes: [
      {
        search: '{ demo: boolean; initialTitle: string; }',
        replace: '{ demo?: boolean; initialTitle?: string; }'
      }
    ]
  }
];

// Apply fixes
function applyFixes() {
  console.log('🔧 Applying TypeScript error fixes...');
  
  typeErrorFixes.forEach(({ file, fixes }) => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📝 Fixing ${file}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      fixes.forEach(({ search, replace }) => {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      });
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${file}`);
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  });
  
  console.log('🎉 All TypeScript fixes applied!');
}

// Run fixes
applyFixes();