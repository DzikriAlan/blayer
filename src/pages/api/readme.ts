import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = resolve(process.cwd(), 'README.md');
    const content = readFileSync(filePath, 'utf-8');
    res.status(200).json({ content });
  } catch {
    res.status(200).json({ content: null });
  }
}
