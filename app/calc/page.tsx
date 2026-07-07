import { redirect } from 'next/navigation';

/**
 * Root redirect page
 * Redirects /calc to the first available item
 */
export default async function CalcRedirectPage() {
  // Redirect to a default item (e.g. Iron Ingot)
  redirect('/calc/iron-ingot');
}
