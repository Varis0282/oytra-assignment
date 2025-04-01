import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


export async function POST(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value;

    await connectToDatabase();

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { street, city, state, zipCode } = body;

    // TODO: Add address to database

    const userId = decoded.userId; // Get user ID from the token

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add address to user's addresses array
    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      isDefault: false, // Default to false for new addresses
    });

    await user.save();

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      user: user,
      message: 'Address added successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 