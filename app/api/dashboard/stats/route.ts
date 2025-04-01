import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock data - replace with actual database queries
const mockStats = {
  totalFiles: 5,
  fileTypes: {
    pdf: 2,
    excel: 1,
    word: 1,
    txt: 1,
  },
  userStats: [
    {
      userId: '1',
      username: 'John Doe',
      fileCount: 3,
    },
    {
      userId: '2',
      username: 'Jane Smith',
      fileCount: 2,
    },
  ],
};

export async function GET(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // TODO: Get actual statistics from database and populate the user name from userId
    const files = await File.find({}, {}).populate('userId', 'username');
    const totalFiles = files.length;

    const fileTypes = files.reduce((acc: any, file: any) => {
      const ext = file.fileType;
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    const userStatsVal = files.reduce((acc: any, file: any) => {
      const userId = file.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          username: file.userId.username,
          fileCount: 0,
        };
      }
      acc[userId].fileCount += 1;
      return acc;
    }, {});
    const userStats = Object.values(userStatsVal);

    // For now, we'll return mock data
    return NextResponse.json({ fileTypes, userStats, totalFiles }, { status: 200 });
  } catch (error) {
    console.log("🚀 => error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 