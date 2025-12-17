// This is a Vercel Serverless Function that securely provides the API key to the frontend.
// It must be placed in the `api` directory at the root of the project.

// We can't import Vercel's types here as we don't have the package, 
// but we can define the parts of the interface we need for type safety.
interface VercelRequest {
  // We don't use any properties of the request in this function.
}

interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => void;
}

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API_KEY environment variable is not set in Vercel project settings.");
      res.status(500).json({ error: 'API_KEY is not configured on the server.' });
      return;
    }

    // Return the key to the client.
    res.status(200).json({ apiKey });
  } catch (error) {
     console.error("Error in /api/get-key:", error);
     res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}
