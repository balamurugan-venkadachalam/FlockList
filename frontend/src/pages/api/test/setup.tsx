import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API endpoint for setting up test data
 * This is used by Playwright e2e tests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Forward the request to the backend
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/test/setup`);
    
    // Return the response from the backend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error setting up test data:', error);
    res.status(500).json({ message: 'Error setting up test data' });
  }
}
