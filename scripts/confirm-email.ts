import { confirmEmailManually } from '../server/supabase-admin';

async function main() {
  try {
    const result = await confirmEmailManually('talal.kassab@alshamal.co');
    console.log('Email confirmation result:', result);
  } catch (error) {
    console.error('Error confirming email:', error);
  }
}

main();