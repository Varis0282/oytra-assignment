import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Filter files for the current user
    const userId = decoded.userId;
    const files = await File.find({ userId });
    if (!files) {
      return NextResponse.json(
        { error: 'No files found' },
        { status: 404 }
      );
    }

    // Map the files to a more readable format
    const userFiles = files.map((file: any) => ({
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      fileType: file.fileType,
      size: file.size,
      uploadDate: file.uploadDate,
    }));



    return NextResponse.json(userFiles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 