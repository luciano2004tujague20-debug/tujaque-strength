import { rmSync } from 'fs';
import { join } from 'path';

const nextDir = join(process.cwd(), '.next');

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('Successfully deleted .next directory');
} catch (err) {
  console.log('.next directory not found or already deleted');
}
