const { execSync } = require('child_process');

console.log('🔧 Running postinstall script...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Postinstall completed successfully!');
} catch (error) {
  console.error('❌ Postinstall failed:', error.message);
  process.exit(1);
}
