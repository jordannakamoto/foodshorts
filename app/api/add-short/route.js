import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, title, addedAt, tags, meal } = body;

    const client = await clientPromise;
    const db = client.db('shortsDB');
    const collection = db.collection('shorts');

    await collection.insertOne({ id, title, addedAt, tags, meal });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error in add-short:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}