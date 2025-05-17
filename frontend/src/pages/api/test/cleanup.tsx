import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API endpoint for cleaning up test data
 * This is used by Playwright e2e tests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Forward the request to the backend
    const { flockId } = req.query;
    const url = flockId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/test/cleanup?flockId=${flockId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/test/cleanup`;
    
    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      }
    });
    
    // Return the response from the backend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    res.status(500).json({ message: 'Error cleaning up test data' });
  }
}
