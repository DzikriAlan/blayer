import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/shared/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string)?.trim() || '';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { username: { contains: search, mode: 'insensitive' as const } },
        { occupation: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, username: true, occupation: true, createdAt: true },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: 'No users found',
        data: [],
        meta: { timestamp: new Date().toISOString(), pagination: { page, limit, total: 0, totalPages: 0 } },
      });
    }

    const data = users.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      username: u.username,
      occupation: u.occupation,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: `Retrieved ${data.length} users`,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2024') {
      return res.status(408).json({ success: false, message: 'Database timeout' });
    }
    if (err.code === 'P2021') {
      return res.status(500).json({ success: false, message: 'Database schema error' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
