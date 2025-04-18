import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('shortsDB');
    const collection = db.collection('shorts');

    const shorts = await collection.find({}).toArray();

    return NextResponse.json(shorts, { status: 200 });
  } catch (err) {
    console.error('Error in get-shorts:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}